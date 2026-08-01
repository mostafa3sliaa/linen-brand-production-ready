import { useState, useEffect } from 'react';
import styles from './MiniCartDrawer.module.css';

type CartItem = {
  id: string;
  colorId: string;
  colorLabel: string;
  colorImage: string;
  size: string;
  quantity: number;
  price: number;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  updateQuantity: (id: string, delta: number) => void;
  removeItem: (id: string) => void;
  onCheckout: () => void;
  isAr: boolean;
};

export default function MiniCartDrawer({
  isOpen,
  onClose,
  cart,
  updateQuantity,
  removeItem,
  onCheckout,
  isAr
}: Props) {
  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = 50;
  const total = subtotal > 0 ? subtotal + shipping : 0;

  if (!isOpen && cart.length === 0) return null; // Fully unmount if empty and closed to save DOM

  return (
    <>
      <div 
        className={`${styles.overlay} ${isOpen ? styles.overlayOpen : ''}`} 
        onClick={onClose}
      />
      
      <div className={`${styles.drawer} ${isOpen ? styles.drawerOpen : ''}`} dir={isAr ? 'rtl' : 'ltr'}>
        <div className={styles.header}>
          <h2>{isAr ? 'سلة المشتريات' : 'Shopping Cart'}</h2>
          <button onClick={onClose} className={styles.closeBtn}>✕</button>
        </div>

        <div className={styles.cartItems}>
          {cart.length === 0 ? (
            <div className={styles.emptyCart}>
              <p>{isAr ? 'السلة فارغة حالياً' : 'Your cart is empty'}</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className={styles.item}>
                <img src={item.colorImage} alt={item.colorLabel} className={styles.itemImg} loading="lazy" />
                
                <div className={styles.itemDetails}>
                  <div className={styles.itemTitleRow}>
                    <h4>{item.colorLabel} - {item.size}</h4>
                    <button onClick={() => removeItem(item.id)} className={styles.removeBtn} aria-label="Remove">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                    </button>
                  </div>
                  
                  <div className={styles.itemPriceRow}>
                    <span className={styles.price}>{item.price} {isAr ? 'ج.م' : 'EGP'}</span>
                    
                    <div className={styles.quantityControls}>
                      <button onClick={() => updateQuantity(item.id, -1)} disabled={item.quantity <= 1}>-</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, 1)}>+</button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className={styles.footer}>
            <div className={styles.summaryRow}>
              <span>{isAr ? 'المجموع' : 'Subtotal'}</span>
              <span>{subtotal} {isAr ? 'ج.م' : 'EGP'}</span>
            </div>
            <div className={styles.summaryRow}>
              <span>{isAr ? 'الشحن' : 'Shipping'}</span>
              <span>{shipping} {isAr ? 'ج.م' : 'EGP'}</span>
            </div>
            <div className={`${styles.summaryRow} ${styles.totalRow}`}>
              <span>{isAr ? 'الإجمالي' : 'Total'}</span>
              <span>{total} {isAr ? 'ج.م' : 'EGP'}</span>
            </div>
            
            <button className={styles.checkoutBtn} onClick={onCheckout}>
              {isAr ? 'إتمام الطلب' : 'Checkout Now'}
            </button>
            <button className={styles.continueShoppingBtn} onClick={onClose}>
              {isAr ? 'إضافة لون أو مقاس آخر' : 'Add another color or size'}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
