"use client";
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowDown } from 'lucide-react';
import styles from './Hero.module.css';

export default function Hero({ dict, lang }: any) {
  const scrollToProducts = () => {
    document.getElementById('collection')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className={styles.heroSection}>
      <Image
        src="https://images.unsplash.com/photo-1594938298593-c50f111059f3?auto=format&fit=crop&q=80&w=2000"
        alt="Mitsh Fashion Hero"
        fill
        priority
        className={styles.bgImage}
        sizes="100vw"
      />
      <div className={styles.overlay} />
      
      <div className={styles.content}>
        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className={styles.title}
        >
          {lang === 'ar' ? 'فن الأناقة الصيفية' : 'The Art of Summer Elegance'}
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className={styles.subtitle}
        >
          {lang === 'ar' ? 'اكتشف مجموعة الكتان الحصرية' : 'Discover the exclusive linen collection'}
        </motion.p>
      </div>

      <motion.button 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1 }}
        className={styles.scrollBtn}
        onClick={scrollToProducts}
        aria-label="Scroll to collection"
      >
        <ArrowDown size={32} />
      </motion.button>
    </section>
  );
}
