"use client";
import { useEffect } from 'react';
import Image from 'next/image';
import styles from './SizeGuideModal.module.css';

export default function SizeGuideModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'auto';
    return () => { document.body.style.overflow = 'auto'; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose} aria-label="إغلاق">&times;</button>
        <div className={styles.imageContainer}>
          <Image 
            src="https://images.unsplash.com/photo-1549439602-43ebca2327af?q=80&w=800&auto=format&fit=crop" 
            alt="جدول المقاسات" 
            fill 
            className={styles.image} 
          />
        </div>
      </div>
    </div>
  );
}
