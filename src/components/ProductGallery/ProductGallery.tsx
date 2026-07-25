"use client";
import { useState, useRef } from 'react';
import Image from 'next/image';
import styles from './ProductGallery.module.css';

export default function ProductGallery({ images, alt }: { images: string[], alt: string }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const scrollLeft = scrollContainerRef.current.scrollLeft;
      const width = scrollContainerRef.current.offsetWidth;
      // scrollLeft is negative in RTL mode in some browsers, take absolute
      const newIndex = Math.round(Math.abs(scrollLeft) / width);
      if (newIndex !== activeIndex) {
        setActiveIndex(newIndex);
      }
    }
  };

  const scrollTo = (index: number) => {
    setActiveIndex(index);
    if (scrollContainerRef.current) {
      const width = scrollContainerRef.current.offsetWidth;
      // In RTL, depending on browser, scrolling might be negative or positive. Next.js App Router sets dir="rtl".
      // Native scroll behavior handles RTL mostly correctly if we just set scrollLeft, but smooth scroll might need precise coordinates.
      // Easiest is to use scrollIntoView on the child element.
      const children = scrollContainerRef.current.children;
      if (children[index]) {
        children[index].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  };

  return (
    <div className={styles.gallery}>
      <div 
        className={`${styles.mainImageContainer} ${isZoomed ? styles.zoomed : ''}`}
        onClick={() => setIsZoomed(!isZoomed)}
      >
        <div 
          className={styles.scrollContainer} 
          ref={scrollContainerRef}
          onScroll={handleScroll}
        >
          {images.map((img, idx) => (
            <div key={idx} className={styles.imageWrapper}>
              <Image 
                src={img} 
                alt={`${alt} - صورة ${idx + 1}`}
                fill
                className={styles.image}
                sizes="(max-width: 768px) 100vw, 50vw"
                priority={idx === 0}
              />
            </div>
          ))}
        </div>
      </div>
      <div className={styles.thumbnails}>
        {images.map((img, idx) => (
          <button 
            key={idx} 
            className={`${styles.thumbnailBtn} ${idx === activeIndex ? styles.active : ''}`}
            onClick={() => scrollTo(idx)}
            aria-label={`View image ${idx + 1}`}
          >
            <Image 
              src={img} 
              alt={`Thumbnail ${idx + 1}`}
              fill
              className={styles.thumbnailImg}
              sizes="80px"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
