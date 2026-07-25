import Image from 'next/image';
import styles from './Hero.module.css';

export default function Hero({ dict, lang }: { dict: any, lang: string }) {
  return (
    <section className={styles.hero}>
      <div className={styles.imageWrapper}>
        <Image 
          src="https://images.unsplash.com/photo-1594938298593-c50f111059f3?q=80&w=2000&auto=format&fit=crop" 
          alt="Hero"
          fill
          priority
          className={styles.image}
        />
        <div className={styles.overlay}></div>
      </div>
      
      <div className={styles.content}>
        <h1 className={styles.title}>{dict.title}</h1>
        <p className={styles.subtitle}>{dict.subtitle}</p>
        <button 
          className={styles.ctaButton} 
          onClick={() => {
            document.getElementById('order-section')?.scrollIntoView({ behavior: 'smooth' });
          }}
        >
          {dict.cta}
        </button>
      </div>
    </section>
  );
}
