"use client";
import Image from 'next/image';
import { motion } from 'framer-motion';
import styles from './Features.module.css';

export default function Features({ lang }: any) {
  const isAr = lang === 'ar';

  const features = [
    {
      title: isAr ? 'خامة فاخرة' : 'Premium Fabric',
      desc: isAr ? 'كتان طبيعي 100% يوفر برودة وراحة فائقة في الصيف.' : '100% natural linen providing ultimate coolness in summer.',
      image: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&q=80&w=600'
    },
    {
      title: isAr ? 'دقة التفاصيل' : 'Meticulous Details',
      desc: isAr ? 'خياطة يدوية دقيقة مع أزرار صدف طبيعي تعكس الفخامة.' : 'Precise hand-stitching with natural shell buttons reflecting luxury.',
      image: 'https://images.unsplash.com/photo-1574015974293-817f0eebc0ff?auto=format&fit=crop&q=80&w=600'
    },
    {
      title: isAr ? 'قصة عصرية' : 'Modern Fit',
      desc: isAr ? 'مصمم ليمنحك إطلالة عصرية تناسب جميع الأوقات والمناسبات.' : 'Designed to give you a modern look suitable for all occasions.',
      image: 'https://images.unsplash.com/photo-1489987707023-afc232f7ea0f?auto=format&fit=crop&q=80&w=600'
    }
  ];

  const trust = [
    { title: isAr ? 'الدفع عند الاستلام' : 'Cash on Delivery', desc: isAr ? 'ادفع براحة وأمان عند استلام طلبك.' : 'Pay securely upon receiving your order.' },
    { title: isAr ? 'شحن لجميع المحافظات' : 'Nationwide Shipping', desc: isAr ? 'توصيل سريع وموثوق لجميع مناطق الجمهورية.' : 'Fast and reliable shipping anywhere.' },
    { title: isAr ? 'استبدال مرن' : 'Flexible Exchange', desc: isAr ? 'استبدال خلال 14 يوم لضمان رضاك التام.' : '14-day exchange to ensure total satisfaction.' }
  ];

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2>{isAr ? 'لماذا ميتش؟' : 'Why MITSH?'}</h2>
        </div>
        
        <div className={styles.grid}>
          {features.map((f, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: i * 0.2 }}
              className={styles.card}
            >
              <div className={styles.imageWrapper}>
                <Image src={f.image} alt={f.title} fill className={styles.image} sizes="(max-width: 768px) 100vw, 33vw"/>
              </div>
              <div className={styles.cardContent}>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className={styles.trustBanner}>
           {trust.map((t, i) => (
             <div key={i} className={styles.trustItem}>
               <h4>{t.title}</h4>
               <p>{t.desc}</p>
             </div>
           ))}
        </div>
      </div>
    </section>
  );
}
