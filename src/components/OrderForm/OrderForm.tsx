"use client";
import { useState } from 'react';
import styles from './OrderForm.module.css';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, CheckCircle2, X } from 'lucide-react';

export default function OrderForm({ 
  product, 
  color, 
  size, 
  dict, 
  lang,
  onClose 
}: any) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    customerName: '', phone: '', governorate: '', city: '', address: '', notes: ''
  });
  const [errors, setErrors] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: null });
    }
  };

  const validateStep = (currentStep: number) => {
    let stepErrors: any = {};
    if (currentStep === 1) {
       if (formData.customerName.length < 3) stepErrors.customerName = "Name is required";
       if (!/^01[0125][0-9]{8}$/.test(formData.phone)) stepErrors.phone = "Invalid Egyptian phone number";
    }
    if (currentStep === 2) {
       if (formData.governorate.length < 2) stepErrors.governorate = "Required";
       if (formData.city.length < 2) stepErrors.city = "Required";
       if (formData.address.length < 5) stepErrors.address = "Detailed address required";
    }
    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const nextStep = () => { if (validateStep(step)) setStep(step + 1); };
  const prevStep = () => setStep(step - 1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(2)) return;
    setIsSubmitting(true);
    
    try {
       const res = await fetch('/api/orders', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({
           ...formData,
           productName: product.name.en,
           color: color.name.en,
           size,
           quantity: 1,
           language: lang
         })
       });
       if (res.ok) setIsSuccess(true);
       else alert("Error submitting order");
    } catch (err) {
       alert("Error submitting order");
    }
    setIsSubmitting(false);
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <motion.div 
        className={styles.drawer} 
        initial={{ x: lang === 'ar' ? '-100%' : '100%' }}
        animate={{ x: 0 }}
        exit={{ x: lang === 'ar' ? '-100%' : '100%' }}
        transition={{ type: 'tween', duration: 0.4, ease: 'circOut' }}
        onClick={(e) => e.stopPropagation()}
      >
        <button className={styles.closeBtn} onClick={onClose}><X size={24}/></button>

        {isSuccess ? (
          <div className={styles.successState}>
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
              <CheckCircle2 size={64} className={styles.successIcon} />
            </motion.div>
            <h2>{lang === 'ar' ? 'تم استلام طلبك بنجاح' : 'Order Received Successfully'}</h2>
            <p>{lang === 'ar' ? 'سيتواصل معك فريقنا قريباً لتأكيد الطلب.' : 'Our team will contact you shortly.'}</p>
            <button className={styles.btnPrimary} onClick={onClose}>{lang === 'ar' ? 'إغلاق' : 'Close'}</button>
          </div>
        ) : (
          <div className={styles.formContainer}>
            <div className={styles.header}>
              <h2>{lang === 'ar' ? 'إتمام الطلب' : 'Complete Order'}</h2>
              <div className={styles.orderSummary}>
                <span>{product.name[lang]}</span>
                <span>• {color.name[lang]}</span>
                <span>• {dict.size}: {size}</span>
              </div>
            </div>

            <div className={styles.progress}>
              <div className={`${styles.step} ${step >= 1 ? styles.activeStep : ''}`} />
              <div className={`${styles.step} ${step >= 2 ? styles.activeStep : ''}`} />
              <div className={`${styles.step} ${step >= 3 ? styles.activeStep : ''}`} />
            </div>

            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className={styles.stepContent}>
                  <h3>{lang === 'ar' ? 'بيانات التواصل' : 'Contact Details'}</h3>
                  <div className={styles.inputGroup}>
                    <input type="text" name="customerName" placeholder={lang === 'ar' ? 'الاسم بالكامل' : 'Full Name'} value={formData.customerName} onChange={handleChange} className={errors.customerName ? styles.inputError : ''} />
                    {errors.customerName && <span className={styles.errorText}>{errors.customerName}</span>}
                  </div>
                  <div className={styles.inputGroup}>
                    <input type="tel" name="phone" placeholder={lang === 'ar' ? 'رقم الموبايل' : 'Phone Number'} value={formData.phone} onChange={handleChange} className={errors.phone ? styles.inputError : ''} dir="ltr" />
                    {errors.phone && <span className={styles.errorText}>{errors.phone}</span>}
                  </div>
                  <button className={styles.btnPrimary} onClick={nextStep}>{lang === 'ar' ? 'التالي' : 'Next'}</button>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className={styles.stepContent}>
                  <h3>{lang === 'ar' ? 'بيانات الشحن' : 'Shipping Details'}</h3>
                  <div className={styles.inputGroup}>
                    <input type="text" name="governorate" placeholder={lang === 'ar' ? 'المحافظة' : 'Governorate'} value={formData.governorate} onChange={handleChange} className={errors.governorate ? styles.inputError : ''} />
                    {errors.governorate && <span className={styles.errorText}>{errors.governorate}</span>}
                  </div>
                  <div className={styles.inputGroup}>
                    <input type="text" name="city" placeholder={lang === 'ar' ? 'المدينة / المنطقة' : 'City / Area'} value={formData.city} onChange={handleChange} className={errors.city ? styles.inputError : ''} />
                    {errors.city && <span className={styles.errorText}>{errors.city}</span>}
                  </div>
                  <div className={styles.inputGroup}>
                    <input type="text" name="address" placeholder={lang === 'ar' ? 'العنوان بالتفصيل' : 'Detailed Address'} value={formData.address} onChange={handleChange} className={errors.address ? styles.inputError : ''} />
                    {errors.address && <span className={styles.errorText}>{errors.address}</span>}
                  </div>
                  <div className={styles.inputGroup}>
                    <input type="text" name="notes" placeholder={lang === 'ar' ? 'ملاحظات (اختياري)' : 'Notes (Optional)'} value={formData.notes} onChange={handleChange} />
                  </div>
                  <div className={styles.btnGroup}>
                    <button className={styles.btnSecondary} onClick={prevStep}>{lang === 'ar' ? 'رجوع' : 'Back'}</button>
                    <button className={styles.btnPrimary} onClick={nextStep}>{lang === 'ar' ? 'مراجعة الطلب' : 'Review Order'}</button>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className={styles.stepContent}>
                  <h3>{lang === 'ar' ? 'تأكيد الطلب' : 'Confirm Order'}</h3>
                  <div className={styles.summaryCard}>
                    <p><strong>{product.name[lang]}</strong></p>
                    <p>{product.price} {dict.currency}</p>
                    <p>{color.name[lang]} - Size {size}</p>
                    <hr className={styles.divider}/>
                    <p>{formData.customerName}</p>
                    <p>{formData.phone}</p>
                    <p>{formData.address}, {formData.city}, {formData.governorate}</p>
                    <p><strong>{lang === 'ar' ? 'الدفع عند الاستلام' : 'Cash on Delivery'}</strong></p>
                  </div>
                  <div className={styles.btnGroup}>
                    <button className={styles.btnSecondary} onClick={prevStep} disabled={isSubmitting}>{lang === 'ar' ? 'تعديل' : 'Edit'}</button>
                    <button className={styles.btnPrimary} onClick={handleSubmit} disabled={isSubmitting}>
                      {isSubmitting ? <Loader2 className={styles.spinner} /> : (lang === 'ar' ? 'تأكيد وشراء' : 'Confirm & Buy')}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </motion.div>
    </div>
  );
}
