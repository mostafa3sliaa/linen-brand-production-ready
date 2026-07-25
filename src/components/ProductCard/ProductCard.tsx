"use client";
import { useState, useMemo } from 'react';
import ProductGallery from '../ProductGallery/ProductGallery';
import SizeGuideModal from '../SizeGuideModal/SizeGuideModal';
import styles from './ProductCard.module.css';

export default function ProductCard({ 
  product, 
  dict,
  lang,
  onOrderNow 
}: { 
  product: any,
  dict: any,
  lang: string,
  onOrderNow: (product: any, color: any, size: string) => void
}) {
  const uniqueColors = useMemo(() => {
    const map = new Map();
    product.variations.forEach((v: any) => {
      if (!map.has(v.color.hex)) {
        map.set(v.color.hex, v.color);
      }
    });
    return Array.from(map.values());
  }, [product.variations]);

  const [selectedColor, setSelectedColor] = useState<any>(uniqueColors[0]);
  const [selectedSize, setSelectedSize] = useState("");
  const [error, setError] = useState("");
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);

  const availableVariations = useMemo(() => {
    return product.variations.filter((v: any) => v.color.hex === selectedColor.hex);
  }, [product.variations, selectedColor]);

  const handleOrderClick = () => {
    if (!selectedSize) {
      setError(dict.selectSizeFirst);
      return;
    }
    setError("");
    onOrderNow(product, selectedColor, selectedSize);
  };

  return (
    <article className={styles.card}>
      <div className={styles.galleryArea}>
        <ProductGallery images={product.images} alt={product.name[lang as 'ar' | 'en']} />
      </div>
      
      <div className={styles.detailsArea}>
        <h3 className={styles.title}>{product.name[lang as 'ar' | 'en']}</h3>
        <p className={styles.price}>{product.price} {dict.currency}</p>
        
        <div className={styles.selectorGroup}>
          <span className={styles.label}>{dict.color}: {selectedColor[lang as 'ar' | 'en']}</span>
          <div className={styles.colorOptions}>
            {uniqueColors.map((color: any) => (
              <button
                key={color.hex}
                className={`${styles.colorBtn} ${selectedColor.hex === color.hex ? styles.active : ''}`}
                style={{ backgroundColor: color.hex }}
                onClick={() => {
                  setSelectedColor(color);
                  setSelectedSize(""); 
                }}
                aria-label={`Select ${color[lang as 'ar' | 'en']}`}
              />
            ))}
          </div>
        </div>

        <div className={styles.selectorGroup}>
          <div className={styles.sizeHeader}>
            <span className={styles.label}>{dict.size}:</span>
            <button className={styles.sizeGuideBtn} onClick={() => setIsSizeGuideOpen(true)}>{dict.sizeGuide}</button>
          </div>
          <div className={styles.sizeOptions}>
            {availableVariations.map((v: any) => (
              <button
                key={v.size}
                disabled={v.stock <= 0}
                className={`
                  ${styles.sizeBtn} 
                  ${selectedSize === v.size ? styles.active : ''} 
                  ${v.stock <= 0 ? styles.outOfStock : ''}
                `}
                onClick={() => {
                  setSelectedSize(v.size);
                  setError("");
                }}
                title={v.stock <= 0 ? dict.outOfStock : ''}
              >
                {v.size}
              </button>
            ))}
          </div>
          {error && <p className={styles.errorText}>{error}</p>}
        </div>

        <button className={styles.orderBtn} onClick={handleOrderClick}>
          {dict.orderNow}
        </button>
      </div>

      <SizeGuideModal isOpen={isSizeGuideOpen} onClose={() => setIsSizeGuideOpen(false)} />
    </article>
  );
}
