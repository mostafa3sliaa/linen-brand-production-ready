import { useEffect } from 'react';
import styles from './SizeGuideModal.module.css';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  sizeChart: Record<string, any>;
  isAr: boolean;
};

export default function SizeGuideModal({ isOpen, onClose, sizeChart, isAr }: Props) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      <div className={styles.overlay} onClick={onClose} />
      <div className={styles.modal}>
        <div className={styles.header}>
          <h3>{isAr ? 'دليل المقاسات' : 'Size Guide'}</h3>
          <button onClick={onClose} className={styles.closeBtn}>✕</button>
        </div>
        
        <div className={styles.content}>
          <div className={styles.tableWrapper}>
            <table className={styles.sizeTable} dir={isAr ? 'rtl' : 'ltr'}>
              <thead>
                <tr>
                  <th>{isAr ? 'المقاس' : 'Size'}</th>
                  <th>{isAr ? 'عرض القميص' : 'Shirt Width'}</th>
                  <th>{isAr ? 'طول القميص' : 'Shirt Length'}</th>
                  <th>{isAr ? 'طول الكم' : 'Sleeve'}</th>
                  <th>{isAr ? 'طول البنطلون' : 'Pants Length'}</th>
                  <th>{isAr ? 'الوزن المناسب' : 'Weight'}</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(sizeChart).map(([size, data]) => (
                  <tr key={size}>
                    <td>{size}</td>
                    <td>{data.shirtWidth}</td>
                    <td>{data.shirtLength}</td>
                    <td>{data.sleeve}</td>
                    <td>{data.pantsLength}</td>
                    <td>{data.weight}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
