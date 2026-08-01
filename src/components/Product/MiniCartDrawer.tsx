import { useState, useEffect } from 'react';
import Image from 'next/image';
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
  colors?: any[];
  sizes?: string[];
  onAdd?: (color: any, size: string) => void;
};

export default function MiniCartDrawer({
  isOpen,
  onClose,
  cart,
  updateQuantity,
  removeItem,
  onCheckout,
  isAr,
  colors,
  sizes,
  onAdd
}: Props) {
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [selectedColor, setSelectedColor] = useState<any>(null);
  const [selectedSize, setSelectedSize] = useState<string>('');

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const timer = setTimeout(() => {
      if (colors && colors.length > 0 && !selectedColor) setSelectedColor(colors[0]);
      if (sizes && sizes.length > 0 && !selectedSize) setSelectedSize(sizes[0]);
    }, 0);
    return () => clearTimeout(timer);
  }, [colors, sizes]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setTimeout(() => setShowQuickAdd(false), 0); // Reset on open
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = 50;
  const total = subtotal > 0 ? subtotal + shipping : 0;

  if (!isOpen && cart.length === 0) return null; // Fully unmount if empty and closed to save DOM

  const handleQuickAdd = () => {
    if (onAdd && selectedColor && selectedSize) {
      onAdd(selectedColor, selectedSize);
      setShowQuickAdd(false);
    }
  };

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
                <Image src={item.colorImage} alt={item.colorLabel} width={80} height={100} className={styles.itemImg} style={{ objectFit: 'cover' }} />
                
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

          {showQuickAdd && colors && sizes && (
            <div className={styles.quickAddSection}>
              <h4>{isAr ? 'اختر اللون والمقاس الجديد' : 'Select new color and size'}</h4>
              <div className={styles.qaColors}>
                {colors.map(c => (
                  <button 
                    key={c.id} 
                    className={`${styles.qaColorBtn} ${selectedColor?.id === c.id ? styles.qaColorActive : ''}`}
                    onClick={() => setSelectedColor(c)}
                  >
                    <span style={{ backgroundColor: c.hex }}></span>
                  </button>
                ))}
              </div>
              <div className={styles.qaSizes}>
                {sizes.map(s => (
                  <button 
                    key={s} 
                    className={`${styles.qaSizeBtn} ${selectedSize === s ? styles.qaSizeActive : ''}`}
                    onClick={() => setSelectedSize(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
              <button className={styles.qaConfirmBtn} onClick={handleQuickAdd}>
                {isAr ? 'إضافة للسلة' : 'Add to Cart'}
              </button>
            </div>
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
            {!showQuickAdd && (
              <button className={styles.continueShoppingBtn} onClick={() => setShowQuickAdd(true)}>
                {isAr ? 'إضافة لون أو مقاس آخر' : 'Add another color or size'}
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
}
