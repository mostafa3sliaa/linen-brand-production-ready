"use client";
import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './ProductStory.module.css';
import { ShoppingBag, ChevronRight, ChevronLeft } from 'lucide-react';

export default function ProductStory({ product, dict, lang, onOrderClick }: any) {
  const [selectedVarIdx, setSelectedVarIdx] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [currentImgIdx, setCurrentImgIdx] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  const selectedVariation = product.variations[selectedVarIdx];
  const images = selectedVariation.images;

  const nextImg = () => setCurrentImgIdx((i) => (i + 1) % images.length);
  const prevImg = () => setCurrentImgIdx((i) => (i - 1 + images.length) % images.length);

  return (
    <section className={styles.storySection}>
      <div className={styles.galleryCol}>
         <div className={styles.mainImageArea} onClick={() => setIsZoomed(!isZoomed)}>
           <AnimatePresence mode="wait">
             <motion.div
               key={currentImgIdx + selectedVariation.sku}
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               transition={{ duration: 0.4 }}
               className={`${styles.imageWrapper} ${isZoomed ? styles.zoomed : ''}`}
             >
               <Image src={images[currentImgIdx]} alt={product.name[lang]} fill className={styles.image} priority={currentImgIdx===0} sizes="(max-width: 768px) 100vw, 50vw" />
             </motion.div>
           </AnimatePresence>
           <button className={styles.navBtnPrev} onClick={(e) => { e.stopPropagation(); prevImg(); }}><ChevronLeft/></button>
           <button className={styles.navBtnNext} onClick={(e) => { e.stopPropagation(); nextImg(); }}><ChevronRight/></button>
         </div>
         <div className={styles.thumbnails}>
           {images.map((img: string, i: number) => (
             <div key={i} className={`${styles.thumb} ${i === currentImgIdx ? styles.activeThumb : ''}`} onClick={() => setCurrentImgIdx(i)}>
               <Image src={img} alt="thumb" fill className={styles.thumbImage} sizes="100px" />
             </div>
           ))}
         </div>
      </div>
      
      <div className={styles.contentCol}>
         <div className={styles.headerInfo}>
           <h2 className={styles.title}>{product.name[lang]}</h2>
           <p className={styles.price}>{product.price} {dict.currency}</p>
         </div>

         <div className={styles.storyBlock}>
           <h3>{product.story.title[lang]}</h3>
           <p>{product.story.description[lang]}</p>
         </div>

         <div className={styles.colorSelector}>
           <p className={styles.label}>{dict.color}: <strong>{selectedVariation.color.name[lang]}</strong></p>
           <div className={styles.colorCircles}>
             {product.variations.map((v: any, idx: number) => (
               <button 
                 key={v.sku} 
                 className={`${styles.colorCircle} ${idx === selectedVarIdx ? styles.activeColor : ''}`}
                 style={{ backgroundColor: v.color.hex }}
                 onClick={() => { setSelectedVarIdx(idx); setCurrentImgIdx(0); setSelectedSize(""); }}
                 aria-label={v.color.name[lang]}
               />
             ))}
           </div>
         </div>

         <div className={styles.sizeSelector}>
           <div className={styles.sizeHeader}>
             <p className={styles.label}>{dict.size}</p>
             <button className={styles.sizeGuideBtn}>{dict.sizeGuide}</button>
           </div>
           <div className={styles.sizeGrid}>
             {selectedVariation.sizes.map((s: any) => (
               <button 
                 key={s.name}
                 disabled={s.stock === 0}
                 className={`
                   ${styles.sizeBtn} 
                   ${s.stock === 0 ? styles.outOfStock : ''}
                   ${selectedSize === s.name ? styles.selectedSize : ''}
                 `}
                 onClick={() => setSelectedSize(s.name)}
               >
                 <span className={styles.sizeName}>{s.name}</span>
                 {s.stock === 1 && <span className={styles.stockStatus}>{lang === 'ar' ? 'آخر قطعة' : 'Last Piece'}</span>}
                 {s.stock === 0 && <span className={styles.stockStatus}>{lang === 'ar' ? 'غير متوفر' : 'Out of Stock'}</span>}
               </button>
             ))}
           </div>
         </div>

         <button 
           className={styles.orderBtn} 
           onClick={() => {
             if (!selectedSize) alert(dict.selectSizeFirst);
             else onOrderClick(product, selectedVariation.color, selectedSize);
           }}
         >
           <ShoppingBag size={20} />
           {dict.orderNow}
         </button>

         <div className={styles.fabricDetails}>
           <details className={styles.accordion}>
             <summary>{lang === 'ar' ? 'الخامة والتفاصيل' : 'Fabric & Details'}</summary>
             <div className={styles.accordionContent}>
               <p>{product.story.fabric[lang]}</p>
               <ul>
                 {product.story.features[lang].map((f: string, i: number) => <li key={i}>{f}</li>)}
               </ul>
             </div>
           </details>
           <details className={styles.accordion}>
             <summary>{lang === 'ar' ? 'دليل العناية' : 'Care Guide'}</summary>
             <div className={styles.accordionContent}>
               <p>{product.story.care[lang]}</p>
             </div>
           </details>
         </div>
      </div>
    </section>
  );
}
