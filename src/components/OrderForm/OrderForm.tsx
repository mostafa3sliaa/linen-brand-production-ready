"use client";
import { useState, useMemo } from 'react';
import { orderSchema } from '@/lib/validations';
import { z } from 'zod';
import styles from './OrderForm.module.css';

export default function OrderForm({
  products,
  dict,
  lang,
  selectedProduct,
  selectedColor,
  selectedSize,
  quantity,
  onProductChange,
  onColorChange,
  onSizeChange,
  onQuantityChange
}: any) {
  // Honeypot field
  const [honeypot, setHoneypot] = useState("");

  const [formData, setFormData] = useState({
    customerName: "",
    phone: "",
    governorate: "",
    city: "",
    address: "",
    notes: ""
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [orderId, setOrderId] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
  };

  const handleProductSelection = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const p = products.find((prod: any) => prod.id === e.target.value);
    onProductChange(p || null);
    if (p) {
      const map = new Map();
      p.variations.forEach((v: any) => {
        if (!map.has(v.color.hex)) map.set(v.color.hex, v.color);
      });
      const uniqueColors = Array.from(map.values());
      onColorChange(uniqueColors[0]);
      onSizeChange("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (honeypot) {
      setErrors({ form: dict.validation.spamDetected });
      return;
    }

    if (!selectedProduct) {
      setErrors({ product: dict.validation.productRequired });
      return;
    }
    if (!selectedColor) {
      setErrors({ color: dict.validation.colorRequired });
      return;
    }
    if (!selectedSize) {
      setErrors({ size: dict.validation.sizeRequired });
      return;
    }

    try {
      orderSchema.parse(formData);
      setErrors({});
    } catch (err) {
      if (err instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        (err as any).errors.forEach((e: any) => {
          if (e.path[0]) fieldErrors[e.path[0].toString()] = e.message;
        });
        setErrors(fieldErrors);
      }
      return;
    }

    setIsSubmitting(true);

    const payload = {
      ...formData,
      productName: selectedProduct.name[lang as 'ar' | 'en'],
      color: selectedColor[lang as 'ar' | 'en'],
      size: selectedSize,
      quantity,
      url: window.location.href,
    };

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 429) {
          throw new Error(dict.validation.spamDetected);
        }
        throw new Error(data.error || "Error processing order");
      }
      
      setSuccess(true);
      setOrderId(data.orderId);
      
      setFormData({ customerName: "", phone: "", governorate: "", city: "", address: "", notes: "" });
      onProductChange(null);
      onColorChange("");
      onSizeChange("");
      onQuantityChange(1);
    } catch (err: any) {
      alert(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const uniqueColors = useMemo(() => {
    if (!selectedProduct) return [];
    const map = new Map();
    selectedProduct.variations.forEach((v: any) => {
      if (!map.has(v.color.hex)) map.set(v.color.hex, v.color);
    });
    return Array.from(map.values());
  }, [selectedProduct]);

  const availableVariations = useMemo(() => {
    if (!selectedProduct || !selectedColor) return [];
    return selectedProduct.variations.filter((v: any) => v.color.hex === selectedColor.hex);
  }, [selectedProduct, selectedColor]);


  if (success) {
    return (
      <section className={styles.orderSection} id="order-section">
        <div className={styles.successMessage}>
          <div className={styles.successIcon}>✓</div>
          <h2>{dict.orderForm.successTitle}</h2>
          <p>{dict.orderForm.orderNumber} <strong>{orderId}</strong></p>
          <p>{dict.orderForm.successMessage}</p>
          <button onClick={() => setSuccess(false)} className={styles.submitBtn}>{dict.orderForm.newOrder}</button>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.orderSection} id="order-section">
      <div className={styles.container}>
        <div className={styles.formHeader}>
          <h2 className={styles.title}>{dict.orderForm.title}</h2>
          <p className={styles.subtitle}>{dict.orderForm.subtitle}</p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          {errors.form && <div className={styles.errorText} style={{textAlign: 'center', fontSize: '1rem', marginBottom: '1rem'}}>{errors.form}</div>}
          
          <div style={{ display: 'none' }} aria-hidden="true">
            <input type="text" name="hp_field" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} tabIndex={-1} autoComplete="off" />
          </div>

          <div className={styles.productSelectionBox}>
            <div className={styles.fieldGroup}>
              <label>{dict.orderForm.product}</label>
              <select 
                value={selectedProduct?.id || ""} 
                onChange={handleProductSelection}
                className={errors.product ? styles.errorInput : ''}
              >
                <option value="">{dict.orderForm.selectProduct}</option>
                {products.map((p: any) => (
                  <option key={p.id} value={p.id}>{p.name[lang as 'ar'|'en']}</option>
                ))}
              </select>
              {errors.product && <span className={styles.errorText}>{errors.product}</span>}
            </div>

            {selectedProduct && (
              <div className={styles.flexRow}>
                <div className={styles.fieldGroup}>
                  <label>{dict.orderForm.color}</label>
                  <select 
                    value={selectedColor?.hex || ""} 
                    onChange={(e) => {
                      const colorObj = uniqueColors.find(c => c.hex === e.target.value);
                      onColorChange(colorObj);
                      onSizeChange("");
                    }}
                    className={errors.color ? styles.errorInput : ''}
                  >
                    <option value="">{dict.orderForm.selectOption}</option>
                    {uniqueColors.map((c: any) => (
                      <option key={c.hex} value={c.hex}>{c[lang as 'ar'|'en']}</option>
                    ))}
                  </select>
                  {errors.color && <span className={styles.errorText}>{errors.color}</span>}
                </div>

                <div className={styles.fieldGroup}>
                  <label>{dict.orderForm.size}</label>
                  <select 
                    value={selectedSize} 
                    onChange={(e) => onSizeChange(e.target.value)}
                    className={errors.size ? styles.errorInput : ''}
                  >
                    <option value="">{dict.orderForm.selectOption}</option>
                    {availableVariations.map((v: any) => (
                      <option key={v.size} value={v.size} disabled={v.stock <= 0}>
                        {v.size} {v.stock <= 0 ? `(${dict.products.outOfStock})` : ''}
                      </option>
                    ))}
                  </select>
                  {errors.size && <span className={styles.errorText}>{errors.size}</span>}
                </div>
                
                <div className={styles.fieldGroup}>
                  <label>{dict.orderForm.quantity}</label>
                  <div className={styles.qtyControl}>
                    <button type="button" onClick={() => onQuantityChange(Math.max(1, quantity - 1))}>-</button>
                    <span>{quantity}</span>
                    <button type="button" onClick={() => onQuantityChange(quantity + 1)}>+</button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className={styles.fieldGroup}>
             <label>{dict.orderForm.name}</label>
             <input type="text" name="customerName" value={formData.customerName} onChange={handleChange} className={errors.customerName ? styles.errorInput : ''} placeholder={dict.orderForm.namePlaceholder} />
             {errors.customerName && <span className={styles.errorText}>{errors.customerName}</span>}
          </div>

          <div className={styles.fieldGroup}>
             <label>{dict.orderForm.phone}</label>
             <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className={errors.phone ? styles.errorInput : ''} placeholder={dict.orderForm.phonePlaceholder} dir="ltr" />
             {errors.phone && <span className={styles.errorText}>{errors.phone}</span>}
          </div>

          <div className={styles.flexRow}>
            <div className={styles.fieldGroup}>
               <label>{dict.orderForm.governorate}</label>
               <input type="text" name="governorate" value={formData.governorate} onChange={handleChange} className={errors.governorate ? styles.errorInput : ''} />
               {errors.governorate && <span className={styles.errorText}>{errors.governorate}</span>}
            </div>
            
            <div className={styles.fieldGroup}>
               <label>{dict.orderForm.city}</label>
               <input type="text" name="city" value={formData.city} onChange={handleChange} className={errors.city ? styles.errorInput : ''} />
               {errors.city && <span className={styles.errorText}>{errors.city}</span>}
            </div>
          </div>

          <div className={styles.fieldGroup}>
             <label>{dict.orderForm.address}</label>
             <input type="text" name="address" value={formData.address} onChange={handleChange} className={errors.address ? styles.errorInput : ''} placeholder={dict.orderForm.addressPlaceholder} />
             {errors.address && <span className={styles.errorText}>{errors.address}</span>}
          </div>

          <div className={styles.fieldGroup}>
             <label>{dict.orderForm.notes}</label>
             <textarea name="notes" value={formData.notes} onChange={handleChange} rows={3} placeholder={dict.orderForm.notesPlaceholder} />
          </div>

          <button type="submit" disabled={isSubmitting} className={styles.submitBtn}>
            {isSubmitting ? <span className={styles.loader}></span> : dict.orderForm.submit}
          </button>
        </form>
      </div>
    </section>
  )
}
