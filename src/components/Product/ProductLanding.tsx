"use client";
import { useState, useRef, useEffect } from 'react';
import ImageGallery from './ImageGallery';
import SizeGuideModal from './SizeGuideModal';
import MiniCartDrawer from './MiniCartDrawer';
import StickyBottomCart from './StickyBottomCart';
import styles from './ProductLanding.module.css';

import { normalizeEgyptianPhone } from '@/lib/validations';

// Import JSON data
import productsData from '@/data/products.json';

function getSafeText(val: any, isAr: boolean, fallback = ''): string {
  if (!val) return fallback;
  if (typeof val === 'string') return val;
  if (typeof val === 'object') {
    return (isAr ? (val.ar || val.en) : (val.en || val.ar)) || fallback;
  }
  return String(val);
}

declare global {
  interface Window {
    fbq?: any;
    ttq?: any;
  }
}

type CartItem = {
  id: string;
  productName?: string;
  colorId: string;
  colorLabel: string;
  colorImage: string;
  size: string;
  quantity: number;
  price: number;
  gender?: string;
};

export default function ProductLanding({ lang, initialProduct }: { lang: string; initialProduct?: any }) {
  const isAr = lang === 'ar';
  const PRODUCT = initialProduct || productsData.products[0];
  const productShipping = typeof PRODUCT?.shipping === 'number' ? PRODUCT.shipping : (Number(PRODUCT?.shipping) || 50);
  const defaultColor = PRODUCT?.colors?.[0] || { id: 'default', label: { ar: 'افتراضي', en: 'Default' }, hex: '#000', images: ['/images/black-suit.jpg'] };
  const defaultSize = PRODUCT?.sizes?.[0] || 'L';

  const [activeColor, setActiveColor] = useState(defaultColor);
  const [activeSize, setActiveSize] = useState(defaultSize);

  useEffect(() => {
    if (PRODUCT?.colors?.[0]) setActiveColor(PRODUCT.colors[0]);
    if (PRODUCT?.sizes?.[0]) setActiveSize(PRODUCT.sizes[0]);
  }, [PRODUCT?.id]);
  
  // Modals / Drawers state
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Cart State
  const [cart, setCart] = useState<CartItem[]>([]);

  // Form State
  const [formData, setFormData] = useState({ name: '', phone: '', governorate: '', address: '', notes: '' });
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
      const itemImage = gender === 'women' && color.femaleImages ? color.femaleImages[0] : (color.images?.[0] || '/images/black-suit.jpg');
      const itemProductName = getSafeText(PRODUCT?.name, isAr, 'منتج');
      const itemColorLabel = getSafeText(color?.label, isAr, 'افتراضي');
      const newItem = {
        id: `${color.id}-${size}-${gender}`,
        productName: itemProductName,
        colorId: color.id,
        colorLabel: itemColorLabel,
        size: size || 'Free Size',
        price: Number(PRODUCT?.price) || 0,
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
    const cleanPhone = normalizeEgyptianPhone(formData.phone);
    if (!cleanPhone || cleanPhone.length < 10) {
      alert(isAr ? 'يرجى إدخال رقم موبايل صحيح (مثال: 01012345678)' : 'Please enter a valid Egyptian mobile number');
      return;
    }
    if (formData.name.trim().length < 2) {
      alert(isAr ? 'يرجى إدخال الاسم بالكامل' : 'Please enter your full name');
      return;
    }
    if (formData.address.trim().length < 3) {
      alert(isAr ? 'يرجى إدخال العنوان بالتفصيل' : 'Please enter your detailed address');
      return;
    }
    setReviewMode(true); // Open the review popup instead of submitting immediately
  };

  const submitFinalOrder = async () => {
    setIsSubmitting(true);
    try {
      const cleanPhone = normalizeEgyptianPhone(formData.phone);
      const payload = {
        customerName: formData.name.trim(),
        phone: cleanPhone || formData.phone.trim(),
        governorate: formData.governorate.trim(),
        address: formData.address.trim(),
        notes: formData.notes?.trim() || '',
        shippingFee: productShipping,
        shipping: productShipping,
        items: cart.map(item => ({
          productName: item.productName || getSafeText(PRODUCT?.name, isAr, 'منتج'),
          color: item.colorLabel || 'افتراضي',
          size: item.size || 'Free Size',
          quantity: Number(item.quantity) || 1,
          price: Number(item.price) || Number(PRODUCT?.price) || 0
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
        setFormData({ name: '', phone: '', governorate: '', address: '', notes: '' });
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(errorData.error || (isAr ? 'حدث خطأ أثناء إرسال الطلب، يرجى مراجعة البيانات والمحاولة مرة أخرى.' : 'Error submitting order, please try again.'));
      }
    } catch (err) {
      console.error("Order submit exception:", err);
      alert(isAr ? 'حدث خطأ في الاتصال، يرجى المحاولة مرة أخرى.' : 'Network error occurred, please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const [gender, setGender] = useState<'men'|'women'>('men');

  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartTotal = cartSubtotal > 0 ? cartSubtotal + productShipping : 0;

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
          
          {PRODUCT?.colors?.some((c: any) => Array.isArray(c.femaleImages) && c.femaleImages.length > 0) && (
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
          )}

          <p className={styles.price}>{PRODUCT.price} {isAr ? 'جنيه' : 'EGP'}</p>
          
          {PRODUCT?.videoUrl && (
            <div style={{ margin: '10px 0 16px' }}>
              <a
                href={PRODUCT.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'linear-gradient(135deg, #111, #333)',
                  color: '#fff',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  fontSize: '13px',
                  fontWeight: 700,
                  textDecoration: 'none',
                  border: '1px solid #444',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                }}
              >
                <span>▶️</span> {isAr ? 'مشاهدة فيديو للمنتج' : 'Watch Product Video'}
              </a>
            </div>
          )}

          {/* Bullet points under price */}
          <ul className={styles.featuresList}>
            {(isAr ? PRODUCT?.features?.ar : PRODUCT?.features?.en)?.map((feature: any, idx: number) => (
              <li key={idx}>✓ {feature}</li>
            ))}
          </ul>
          
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>{isAr ? 'اللون' : 'Color'}: <span>{isAr ? activeColor.label.ar : activeColor.label.en}</span></h3>
            <div className={styles.colorOptions}>
              {PRODUCT?.colors?.map((color: any) => (
                <button
                  key={color.id}
                  onClick={() => setActiveColor(color)}
                  className={`${styles.colorBtn} ${activeColor.id === color.id ? styles.activeColor : ''}`}
                  style={{ backgroundColor: color.id === 'black' ? '#000' : color.id === 'white' ? '#fff' : color.hex || '#d2b48c' }}
                  aria-label={isAr ? color.label.ar : color.label.en}
                />
              ))}
            </div>
          </div>

          <div className={styles.section}>
            <div className={styles.sizeHeader}>
              <h3 className={styles.sectionTitle}>{isAr ? 'المقاس' : 'Size'}: <span>{activeSize}</span></h3>
              {PRODUCT?.sizeChart && PRODUCT?.hasSizeChart !== false && (
                <button className={styles.sizeGuideBtn} onClick={() => setIsSizeGuideOpen(true)}>
                  📏 {isAr ? 'جدول المقاسات' : 'Size Chart'}
                </button>
              )}
            </div>
            <div className={styles.sizeOptions}>
              {PRODUCT?.sizes?.map((size: any) => (
                <button
                  key={size}
                  onClick={() => setActiveSize(size)}
                  className={`${styles.sizeBtn} ${activeSize === size ? styles.activeSize : ''}`}
                >
                  {size}
                </button>
              ))}
            </div>

            {/* Dynamic Size Info */}
            {PRODUCT?.hasSizeChart !== false && PRODUCT?.sizeChart?.[activeSize] && (
              <div className={styles.dynamicSizeInfo}>
                <div className={styles.sizeInfoWeight}>
                  <span>{isAr ? 'الوزن المناسب:' : 'Ideal Weight:'}</span>
                  <strong>{PRODUCT.sizeChart[activeSize]?.weight || '-'}</strong>
                </div>
                <div className={styles.sizeMeasurements}>
                  {PRODUCT.sizeChart[activeSize]?.shirtWidth && <span>{isAr ? 'عرض القميص' : 'Shirt Width'}: {PRODUCT.sizeChart[activeSize]?.shirtWidth} {isAr ? 'سم' : 'cm'}</span>}
                  {PRODUCT.sizeChart[activeSize]?.shirtLength && <span>{isAr ? 'طول القميص' : 'Shirt Length'}: {PRODUCT.sizeChart[activeSize]?.shirtLength} {isAr ? 'سم' : 'cm'}</span>}
                  {PRODUCT.sizeChart[activeSize]?.pantsLength && <span>{isAr ? 'طول البنطلون' : 'Pants Length'}: {PRODUCT.sizeChart[activeSize]?.pantsLength} {isAr ? 'سم' : 'cm'}</span>}
                </div>
              </div>
            )}
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
              <input 
                type="text" 
                placeholder={isAr ? 'المحافظة' : 'Governorate'} 
                required 
                className={styles.input}
                value={formData.governorate}
                onChange={e => setFormData({...formData, governorate: e.target.value})}
              />
              <textarea 
                placeholder={isAr ? 'العنوان التفصيلي (المنطقة، الشارع، رقم العمارة، الشقة)' : 'Detailed Address'} 
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
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#666', marginBottom: '6px' }}>
                  <span>{isAr ? 'قيمة المنتجات' : 'Products Subtotal'}</span>
                  <span>{cartSubtotal} {isAr ? 'ج.م' : 'EGP'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#666', marginBottom: '10px' }}>
                  <span>{isAr ? 'مصاريف الشحن' : 'Shipping'}</span>
                  <span>{productShipping} {isAr ? 'ج.م' : 'EGP'}</span>
                </div>
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
                  <span>{productShipping} {isAr ? 'ج.م' : 'EGP'}</span>
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
        shipping={productShipping}
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
