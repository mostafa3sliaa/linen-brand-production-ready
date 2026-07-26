"use client";
import { useState, useRef, MouseEvent, useEffect } from 'react';
import styles from './ImageGallery.module.css';

type Color = {
  id: string;
  label: { ar: string; en: string };
  images: string[];
};

type Props = {
  colors: Color[];
  activeColorId: string;
  onColorChange: (color: Color) => void;
  isAr: boolean;
};

export default function ImageGallery({ colors, activeColorId, onColorChange, isAr }: Props) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoomStyle, setZoomStyle] = useState({});
  const [isZooming, setIsZooming] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Determine active index based on activeColorId
  const activeIndex = colors.findIndex(c => c.id === activeColorId);
  const safeActiveIndex = activeIndex >= 0 ? activeIndex : 0;

  const isScrollingRef = useRef(false);

  // Sync scroll position when activeColorId changes externally
  useEffect(() => {
    if (scrollContainerRef.current) {
      const child = scrollContainerRef.current.children[safeActiveIndex] as HTMLElement;
      if (child) {
        isScrollingRef.current = true;
        child.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        
        // Reset flag after animation completes
        setTimeout(() => {
          isScrollingRef.current = false;
        }, 500);
      }
    }
  }, [safeActiveIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        const nextIndex = Math.min(colors.length - 1, safeActiveIndex + 1);
        onColorChange(colors[nextIndex]);
      } else if (e.key === 'ArrowLeft') {
        const prevIndex = Math.max(0, safeActiveIndex - 1);
        onColorChange(colors[prevIndex]);
      } else if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [colors, safeActiveIndex, isFullscreen, onColorChange]);

  // Sync state on mobile swipe
  const handleScroll = () => {
    if (!scrollContainerRef.current || isScrollingRef.current) return;
    
    const scrollX = scrollContainerRef.current.scrollLeft;
    const itemWidth = scrollContainerRef.current.clientWidth;
    const index = Math.round(Math.abs(scrollX) / itemWidth);
    
    if (index !== safeActiveIndex && colors[index]) {
      onColorChange(colors[index]);
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

      {/* Main Swipeable / Zoomable Container */}
      <div 
        className={styles.mainContainer}
        ref={scrollContainerRef}
        onScroll={handleScroll}
      >
        {colors.map((color, idx) => (
          <div 
            key={color.id} 
            className={styles.imageItem}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onClick={() => { if(!isFullscreen && window.innerWidth >= 768) setIsFullscreen(true); }}
          >
            <img 
              src={color.images[0]} 
              alt={isAr ? color.label.ar : color.label.en}
              className={`${styles.mainImage} ${isZooming && safeActiveIndex === idx ? styles.zoomed : ''}`}
              style={isZooming && safeActiveIndex === idx ? zoomStyle : {}}
              loading={idx === 0 ? 'eager' : 'lazy'}
            />
          </div>
        ))}
      </div>

      {/* Pagination dots for Mobile */}
      <div className={styles.pagination}>
        {colors.map((color, idx) => (
          <div 
            key={color.id} 
            className={`${styles.dot} ${safeActiveIndex === idx ? styles.activeDot : ''}`}
            onClick={() => onColorChange(color)}
          />
        ))}
      </div>

      {/* Thumbnails for Desktop */}
      {!isFullscreen && (
        <div className={styles.thumbnailList}>
          {colors.map((color, idx) => (
            <button 
              key={color.id}
              onClick={() => onColorChange(color)}
              className={`${styles.thumbnailBtn} ${safeActiveIndex === idx ? styles.activeThumb : ''}`}
              aria-label={isAr ? color.label.ar : color.label.en}
            >
              <img src={color.images[0]} alt="" loading="lazy" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
