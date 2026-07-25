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
        src="/images/hero.jpg"
        alt="Mitsh Fashion Hero"
        fill
        priority
        className={styles.bgImage}
        sizes="100vw"
      />
      {/* Overlay removed to show the text in the image clearly */}
      
      {/* Text removed because the image already contains the Brand Name and Slogan */}
      
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
