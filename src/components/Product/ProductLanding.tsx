"use client";
import { useState, useRef, useEffect } from 'react';
import ImageGallery from './ImageGallery';
import SizeGuideModal from './SizeGuideModal';
import MiniCartDrawer from './MiniCartDrawer';
import StickyBottomCart from './StickyBottomCart';
import styles from './ProductLanding.module.css';

// Import JSON data
import productsData from '@/data/products.json';

declare global {
  interface Window {
    fbq?: any;
    ttq?: any;
  }
}

// In a real app we'd fetch by ID. Here we just take the first product.
const PRODUCT = productsData.products[0];

type CartItem = {
  id: string;
  colorId: string;
  colorLabel: string;
  colorImage: string;
  size: string;
  quantity: number;
  price: number;
};

export default function ProductLanding({ lang }: { lang: string }) {
  const isAr = lang === 'ar';
  const [activeColor, setActiveColor] = useState(PRODUCT.colors[0]);
  const [activeSize, setActiveSize] = useState(PRODUCT.sizes[0]);
  
  // Modals / Drawers state
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Cart State
  const [cart, setCart] = useState<CartItem[]>([]);

  // Form State
  const [formData, setFormData] = useState({ name: '', phone: '', address: '', notes: '' });
  const [reviewMode, setReviewMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('linen_brand_cart');
    const savedInfo = localStorage.getItem('linen_brand_user_info');
    
    setTimeout(() => {
      if (savedCart) {
        try { setCart(JSON.parse(savedCart)); } catch (e) {}
      }
      if (savedInfo) {
        try { setFormData(JSON.parse(savedInfo)); } catch (e) {}
      }
    }, 0);
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('linen_brand_cart', JSON.stringify(cart));
  }, [cart]);

  // Save user info to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('linen_brand_user_info', JSON.stringify(formData));
  }, [formData]);

  // Handle success message timeout
  useEffect(() => {
    if (submitted) {
      const timer = setTimeout(() => {
        setSubmitted(false);
      }, 3000); // 3 seconds
      return () => clearTimeout(timer);
    }
  }, [submitted]);

  const checkoutRef = useRef<HTMLDivElement>(null);

  const addToCart = (color = activeColor, size = activeSize) => {
    if (!color || !size) return;
    const existingItem = cart.find(item => item.id === `${color.id}-${size}-${gender}`);
    
    if (existingItem) {
      updateQuantity(existingItem.id, existingItem.quantity + 1);
    } else {
      const itemImage = gender === 'women' && color.femaleImages ? color.femaleImages[0] : color.images[0];
      const newItem = {
        id: `${color.id}-${size}-${gender}`,
        productName: isAr ? PRODUCT.name.ar : PRODUCT.name.en,
        colorId: color.id,
        colorLabel: isAr ? color.label.ar : color.label.en,
        size,
        price: PRODUCT.price,
        quantity: 1,
        colorImage: itemImage,
        gender: gender
      };
      setCart([...cart, newItem]);
    }

    setIsCartOpen(true);

    // Pixel Event: AddToCart
    if (typeof window !== 'undefined') {
      if (window.fbq) window.fbq('track', 'AddToCart', { value: PRODUCT.price, currency: 'EGP' });
      if (window.ttq) window.ttq.track('AddToCart', { value: PRODUCT.price, currency: 'EGP' });
    }
    
    // Auto-scroll back up slightly for mobile if they clicked from sticky
    setTimeout(() => {
      checkoutRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 300);
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(cart.map(item => {
      if (item.id === id) {
        return { ...item, quantity: Math.max(1, item.quantity + delta) };
      }
      return item;
    }));
  };

  const removeItem = (id: string) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const handleCheckoutClick = () => {
    setIsCartOpen(false);
    setTimeout(() => {
      checkoutRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 300);

    if (typeof window !== 'undefined') {
      if (window.fbq) window.fbq('track', 'InitiateCheckout', { value: cartTotal, currency: 'EGP' });
      if (window.ttq) window.ttq.track('InitiateCheckout', { value: cartTotal, currency: 'EGP' });
    }
  };

  const handleOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    setReviewMode(true); // Open the review popup instead of submitting immediately
  };

  const submitFinalOrder = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        customerName: formData.name,
        phone: formData.phone,
        address: formData.address,
        notes: formData.notes,
        items: cart.map(item => ({
          productName: isAr ? PRODUCT.name.ar : PRODUCT.name.en,
          color: item.colorLabel,
          size: item.size,
          quantity: item.quantity,
          price: item.price
        }))
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setReviewMode(false);
        setSubmitted(true);
        
        // Pixel Event: Purchase
        if (typeof window !== 'undefined') {
          if (window.fbq) window.fbq('track', 'Purchase', { value: cartTotal, currency: 'EGP' });
          if (window.ttq) window.ttq.track('CompletePayment', { value: cartTotal, currency: 'EGP' });
        }
        
        setCart([]); // Empty the cart
        setFormData({ name: '', phone: '', address: '', notes: '' });
      } else {
        alert(isAr ? 'حدث خطأ أثناء إرسال الطلب، يرجى المحاولة مرة أخرى.' : 'Error submitting order, please try again.');
      }
    } catch (err) {
      console.error(err);
      alert(isAr ? 'حدث خطأ غير متوقع.' : 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const [gender, setGender] = useState<'men'|'women'>('men');

  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartTotal = cartSubtotal > 0 ? cartSubtotal + PRODUCT.shipping : 0;

  return (
    <div className={styles.container}>
      <div className={styles.grid}>
        
        <div className={styles.gallerySection}>
          <ImageGallery 
            colors={PRODUCT.colors} 
            activeColorId={activeColor.id} 
            onColorChange={setActiveColor}
            isAr={isAr}
            gender={gender}
          />
        </div>

        {/* Right Column: Product Details (First Screen) */}
        <div className={styles.productDetails}>
          <h1 className={styles.title}>{isAr ? PRODUCT.name.ar : PRODUCT.name.en}</h1>
          
          <div className={styles.genderToggleContainer}>
            <button 
              className={`${styles.genderBtn} ${gender === 'men' ? styles.genderBtnActiveMen : ''}`}
              onClick={() => setGender('men')}
            >
              {isAr ? 'رجالي' : "Men's"}
            </button>
            <button 
              className={`${styles.genderBtn} ${gender === 'women' ? styles.genderBtnActiveWomen : ''}`}
              onClick={() => setGender('women')}
            >
              {isAr ? 'حريمي' : "Women's"}
            </button>
          </div>

          <p className={styles.price}>{PRODUCT.price} {isAr ? 'جنيه' : 'EGP'}</p>
          
          {/* Bullet points under price */}
          <ul className={styles.featuresList}>
            {(isAr ? PRODUCT.features.ar : PRODUCT.features.en).map((feature, idx) => (
              <li key={idx}>✓ {feature}</li>
            ))}
          </ul>
          
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>{isAr ? 'اللون' : 'Color'}: <span>{isAr ? activeColor.label.ar : activeColor.label.en}</span></h3>
            <div className={styles.colorOptions}>
              {PRODUCT.colors.map(color => (
                <button
                  key={color.id}
                  onClick={() => setActiveColor(color)}
                  className={`${styles.colorBtn} ${activeColor.id === color.id ? styles.activeColor : ''}`}
                  style={{ backgroundColor: color.id === 'black' ? '#000' : color.id === 'white' ? '#fff' : '#d2b48c' }}
                  aria-label={isAr ? color.label.ar : color.label.en}
                />
              ))}
            </div>
          </div>

          <div className={styles.section}>
            <div className={styles.sizeHeader}>
              <h3 className={styles.sectionTitle}>{isAr ? 'المقاس' : 'Size'}: <span>{activeSize}</span></h3>
              <button className={styles.sizeGuideBtn} onClick={() => setIsSizeGuideOpen(true)}>
                📏 {isAr ? 'جدول المقاسات' : 'Size Chart'}
              </button>
            </div>
            <div className={styles.sizeOptions}>
              {PRODUCT.sizes.map(size => (
                <button
                  key={size}
                  onClick={() => setActiveSize(size)}
                  className={`${styles.sizeBtn} ${activeSize === size ? styles.activeSize : ''}`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <button className={styles.ctaBtn} onClick={() => addToCart()}>
            {isAr ? 'أضف إلى الطلب' : 'Add to Cart'}
          </button>
        </div>

      </div>

      {/* Checkout Form Section (At the very bottom) */}
      <div ref={checkoutRef} className={styles.checkoutWrapper}>
        {cart.length > 0 && !submitted && (
          <div className={styles.checkoutSection}>
            <h2 className={styles.checkoutTitle}>{isAr ? 'إتمام الطلب' : 'Complete Order'}</h2>
            <form onSubmit={handleOrder} className={styles.form}>
              <input 
                type="text" 
                placeholder={isAr ? 'الاسم بالكامل' : 'Full Name'} 
                required 
                className={styles.input}
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
              <input 
                type="tel" 
                placeholder={isAr ? 'رقم الموبايل' : 'Phone Number'} 
                required 
                className={styles.input}
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
              />
              <textarea 
                placeholder={isAr ? 'العنوان بالتفصيل (المحافظة، المنطقة، الشارع)' : 'Full Address'} 
                required 
                className={styles.textarea}
                value={formData.address}
                onChange={e => setFormData({...formData, address: e.target.value})}
              />
              <textarea 
                placeholder={isAr ? 'ملاحظات إضافية (اختياري)' : 'Order Notes (Optional)'} 
                className={styles.textarea}
                value={formData.notes}
                onChange={e => setFormData({...formData, notes: e.target.value})}
              />
              
              <div className={styles.summary}>
                <div className={styles.summaryTotal}>
                  <span>{isAr ? 'الإجمالي المطلوب' : 'Total Required'}</span>
                  <span>{cartTotal} {isAr ? 'ج.م' : 'EGP'}</span>
                </div>
              </div>

              <button type="submit" className={styles.ctaBtn}>
                {isAr ? 'تأكيد الطلب الآن' : 'Confirm Order Now'}
              </button>
            </form>
          </div>
        )}

        {/* Review Order Popup */}
        {reviewMode && (
          <div className={styles.successPopupOverlay}>
            <div className={styles.successPopup}>
              <h3>{isAr ? 'مراجعة وتأكيد الطلب' : 'Review Your Order'}</h3>
              <p className={styles.successNote}>{isAr ? 'يرجى مراجعة تفاصيل طلبك قبل التأكيد النهائي.' : 'Please review your order details before confirming.'}</p>
              
              <div className={styles.invoiceBox}>
                <h4 className={styles.invoiceTitle}>{isAr ? 'الفاتورة' : 'Invoice'}</h4>
                <div className={styles.invoiceItems}>
                  {cart.map((item: any, idx: number) => (
                    <div key={idx} className={styles.invoiceItem}>
                      <span>{item.quantity}x {item.colorLabel} - {item.size}</span>
                      <span>{item.price * item.quantity} {isAr ? 'ج.م' : 'EGP'}</span>
                    </div>
                  ))}
                </div>
                <div className={styles.invoiceDivider}></div>
                <div className={styles.invoiceRow}>
                  <span>{isAr ? 'الشحن' : 'Shipping'}</span>
                  <span>{PRODUCT.shipping} {isAr ? 'ج.م' : 'EGP'}</span>
                </div>
                <div className={`${styles.invoiceRow} ${styles.invoiceTotal}`}>
                  <span>{isAr ? 'الإجمالي' : 'Total'}</span>
                  <span>{cartTotal} {isAr ? 'ج.م' : 'EGP'}</span>
                </div>
              </div>
              
              <div className={styles.reviewActions}>
                <button 
                  className={styles.closeSuccessBtn} 
                  onClick={submitFinalOrder}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (isAr ? 'جاري الإرسال...' : 'Submitting...') : (isAr ? 'إتمام الطلب ❤️' : 'Complete Order ❤️')}
                </button>
                <button 
                  className={styles.cancelReviewBtn} 
                  onClick={() => setReviewMode(false)}
                  disabled={isSubmitting}
                >
                  {isAr ? 'إلغاء الطلب 💔' : 'Cancel Order 💔'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Small Success Toast/Popup */}
        {submitted && (
          <div className={styles.successPopupOverlay}>
            <div className={styles.successPopup}>
              <div className={styles.successIcon}>✓</div>
              <h3>{isAr ? 'تم استلام طلبك بنجاح!' : 'Order received successfully!'}</h3>
              <p>{isAr ? 'سنتواصل معك قريباً لتأكيد الشحن.' : 'We will contact you soon.'}</p>
            </div>
          </div>
        )}
      </div>

      {/* Drawers and Modals */}
      <MiniCartDrawer 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        updateQuantity={updateQuantity}
        removeItem={removeItem}
        onCheckout={handleCheckoutClick}
        isAr={isAr}
        colors={PRODUCT.colors}
        sizes={PRODUCT.sizes}
        onAdd={addToCart}
      />

      <SizeGuideModal 
        isOpen={isSizeGuideOpen}
        onClose={() => setIsSizeGuideOpen(false)}
        sizeChart={PRODUCT.sizeChart}
        isAr={isAr}
      />

      <StickyBottomCart 
        itemCount={cartItemsCount}
        totalPrice={cartTotal}
        onOpenCart={() => setIsCartOpen(true)}
        isAr={isAr}
      />
    </div>
  );
}
