"use client";
import { useState, useRef, MouseEvent, useEffect, useMemo } from 'react';
import Image from 'next/image';
import styles from './ImageGallery.module.css';

type Color = {
  id: string;
  label: { ar: string; en: string };
  hex: string;
  images: string[];
  femaleImages: string[];
};

type GalleryItem = {
  id: string;
  src: string;
  label: string;
  color?: Color;
};

type Props = {
  colors: Color[];
  activeColorId: string;
  onColorChange: (color: Color) => void;
  isAr: boolean;
  gender: 'men' | 'women';
};

export default function ImageGallery({ colors, activeColorId, onColorChange, isAr, gender }: Props) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoomStyle, setZoomStyle] = useState({});
  const [isZooming, setIsZooming] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Active color
  const activeColor = colors.find(c => c.id === activeColorId) || colors[0];

  // Build the list of images to display
  const galleryImages: GalleryItem[] = useMemo(() => {
    // 1. If active color has multiple images, show all of them!
    if (activeColor?.images && activeColor.images.length > 1) {
      return activeColor.images.map((img: string, i: number) => ({
        id: `${activeColor.id}-${i}`,
        src: img,
        label: isAr ? activeColor.label?.ar || '' : activeColor.label?.en || '',
      }));
    }

    // 2. If multiple colors exist (e.g. black, beige, white suits)
    if (colors.length > 1) {
      return colors.map((c) => {
        const src = gender === 'women' && c.femaleImages ? c.femaleImages[0] : (c.images?.[0] || '/images/black-suit.jpg');
        return {
          id: c.id,
          src,
          label: isAr ? c.label?.ar || '' : c.label?.en || '',
          color: c,
        };
      });
    }

    // 3. Single color with its images
    const imgs = activeColor?.images?.length ? activeColor.images : ['/images/black-suit.jpg'];
    return imgs.map((img: string, i: number) => ({
      id: `img-${i}`,
      src: img,
      label: isAr ? activeColor?.label?.ar || '' : activeColor?.label?.en || '',
    }));
  }, [colors, activeColor, gender, isAr]);

  const [activeIndex, setActiveIndex] = useState(0);
  const isScrollingRef = useRef(false);

  // Sync scroll position
  const scrollTo = (index: number) => {
    const safeIdx = Math.max(0, Math.min(galleryImages.length - 1, index));
    setActiveIndex(safeIdx);
    if (scrollContainerRef.current) {
      const child = scrollContainerRef.current.children[safeIdx] as HTMLElement;
      if (child) {
        isScrollingRef.current = true;
        child.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        setTimeout(() => {
          isScrollingRef.current = false;
        }, 400);
      }
    }
    const item = galleryImages[safeIdx] as any;
    if (item?.color) {
      onColorChange(item.color);
    }
  };

  // Sync when activeColorId changes externally
  useEffect(() => {
    const idx = galleryImages.findIndex((item: any) => item.color?.id === activeColorId);
    if (idx >= 0) {
      scrollTo(idx);
    }
  }, [activeColorId]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        scrollTo(activeIndex + 1);
      } else if (e.key === 'ArrowLeft') {
        scrollTo(activeIndex - 1);
      } else if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [galleryImages, activeIndex, isFullscreen]);

  // Sync state on swipe
  const handleScroll = () => {
    if (!scrollContainerRef.current || isScrollingRef.current) return;
    const scrollX = scrollContainerRef.current.scrollLeft;
    const itemWidth = scrollContainerRef.current.clientWidth;
    const index = Math.round(Math.abs(scrollX) / itemWidth);
    if (index !== activeIndex && galleryImages[index]) {
      setActiveIndex(index);
      const item = galleryImages[index] as any;
      if (item?.color) {
        onColorChange(item.color);
      }
    }
  };

  // Desktop Hover Zoom Effect
  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (window.innerWidth < 768 || isFullscreen) return; 
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setIsZooming(true);
    setZoomStyle({
      transformOrigin: `${x}% ${y}%`,
      transform: 'scale(1.5)'
    });
  };

  const handleMouseLeave = () => {
    setIsZooming(false);
    setZoomStyle({
      transformOrigin: 'center center',
      transform: 'scale(1)'
    });
  };

  return (
    <div className={`${styles.galleryWrapper} ${isFullscreen ? styles.fullscreen : ''}`}>
      {isFullscreen && (
        <button className={styles.closeFullscreen} onClick={() => setIsFullscreen(false)}>✕</button>
      )}

      {/* Main Swipeable Container */}
      <div 
        className={styles.mainContainer}
        ref={scrollContainerRef}
        onScroll={handleScroll}
      >
        {galleryImages.map((item, idx) => (
          <div 
            key={item.id || idx} 
            className={styles.imageItem}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onClick={() => { if(!isFullscreen && window.innerWidth >= 768) setIsFullscreen(true); }}
          >
            <div style={{ position: 'relative', width: '100%', height: '100%' }}>
              {item.src?.startsWith('data:') || item.src?.startsWith('blob:') ? (
                <img 
                  src={item.src} 
                  alt={item.label}
                  className={`${styles.mainImage} ${isZooming && activeIndex === idx ? styles.zoomed : ''}`}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', ...(isZooming && activeIndex === idx ? zoomStyle : {}) }}
                />
              ) : (
                <Image 
                  src={item.src || '/images/black-suit.jpg'} 
                  alt={item.label}
                  fill
                  unoptimized
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className={`${styles.mainImage} ${isZooming && activeIndex === idx ? styles.zoomed : ''}`}
                  style={{ objectFit: 'cover', ...(isZooming && activeIndex === idx ? zoomStyle : {}) }}
                  priority={idx === 0}
                />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination dots for Mobile */}
      {galleryImages.length > 1 && (
        <div className={styles.pagination}>
          {galleryImages.map((item, idx) => (
            <div 
              key={item.id || idx} 
              className={`${styles.dot} ${activeIndex === idx ? styles.activeDot : ''}`}
              onClick={() => scrollTo(idx)}
            />
          ))}
        </div>
      )}

      {/* Thumbnails for Desktop */}
      {!isFullscreen && galleryImages.length > 1 && (
        <div className={styles.thumbnailList}>
          {galleryImages.map((item, idx) => (
            <button 
              key={item.id || idx}
              onClick={() => scrollTo(idx)}
              className={`${styles.thumbnailBtn} ${activeIndex === idx ? styles.activeThumb : ''}`}
              aria-label={item.label}
            >
              {item.src?.startsWith('data:') || item.src?.startsWith('blob:') ? (
                <img src={item.src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <Image src={item.src || '/images/black-suit.jpg'} alt="" fill unoptimized sizes="80px" style={{ objectFit: 'cover' }} />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
