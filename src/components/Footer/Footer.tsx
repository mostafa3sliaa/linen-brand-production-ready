import styles from './Footer.module.css';

export default function Footer({ lang }: any) {
  const isAr = lang === 'ar';
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.brandInfo}>
          <h2 className={styles.logo}>MITSH</h2>
          <p className={styles.tagline}>{isAr ? 'حيث تلتقي البساطة بالفخامة.' : 'Where simplicity meets luxury.'}</p>
        </div>
        
        <div className={styles.linksBlock}>
          <h3>{isAr ? 'السياسات' : 'Policies'}</h3>
          <ul>
            <li><a href="#">{isAr ? 'سياسة الاستبدال' : 'Exchange Policy'}</a></li>
            <li><a href="#">{isAr ? 'سياسة الخصوصية' : 'Privacy Policy'}</a></li>
            <li><a href="#">{isAr ? 'الشروط والأحكام' : 'Terms & Conditions'}</a></li>
          </ul>
        </div>
        
        <div className={styles.linksBlock}>
          <h3>{isAr ? 'تواصل معنا' : 'Contact Us'}</h3>
          <ul>
            <li><a href="#">WhatsApp</a></li>
            <li><a href="#">Instagram</a></li>
            <li><a href="#">TikTok</a></li>
          </ul>
        </div>
      </div>
      
      <div className={styles.copyright}>
        <p>&copy; {new Date().getFullYear()} MITSH. {isAr ? 'جميع الحقوق محفوظة.' : 'All rights reserved.'}</p>
      </div>
    </footer>
  );
}
