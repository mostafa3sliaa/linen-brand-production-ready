"use client";
import { useState, useEffect } from 'react';
import styles from './StickyBottomCart.module.css';

type Props = {
  itemCount: number;
  totalPrice: number;
  onOpenCart: () => void;
  isAr: boolean;
};

export default function StickyBottomCart({ itemCount, totalPrice, onOpenCart, isAr }: Props) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show sticky cart after scrolling down 500px (past the main image)
      if (window.scrollY > 500 && itemCount > 0) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    // Initial check
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [itemCount]);

  if (!isVisible) return null;

  return (
    <div className={styles.stickyBar} dir={isAr ? 'rtl' : 'ltr'}>
      <div className={styles.container}>
        <div className={styles.cartInfo}>
          <span className={styles.count}>{itemCount} {isAr ? 'قطع' : 'Items'}</span>
          <span className={styles.price}>{totalPrice} {isAr ? 'ج.م' : 'EGP'}</span>
        </div>
        <button onClick={onOpenCart} className={styles.checkoutBtn}>
          {isAr ? 'إتمام الطلب' : 'Checkout'}
        </button>
      </div>
    </div>
  );
}
