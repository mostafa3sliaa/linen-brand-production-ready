"use client";
import { useState, use } from 'react';
import Hero from '@/components/Hero/Hero';
import ProductList from '@/components/ProductList/ProductList';
import OrderForm from '@/components/OrderForm/OrderForm';
import styles from '../page.module.css'; 
import productsData from '@/data/products.json';
import arDict from '@/dictionaries/ar.json';
import enDict from '@/dictionaries/en.json';

export default function Home({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = use(params);
  const dict = lang === 'en' ? enDict : arDict;

  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);

  const handleOrderNow = (product: any, color: string, size: string) => {
    setSelectedProduct(product);
    setSelectedColor(color);
    setSelectedSize(size);
    document.getElementById('order-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <main className={styles.main}>
      <Hero dict={dict.hero} lang={lang} />
      <ProductList 
        products={productsData} 
        dict={dict.products} 
        lang={lang}
        onOrderNow={handleOrderNow} 
      />
      <OrderForm 
        products={productsData}
        dict={dict}
        lang={lang}
        selectedProduct={selectedProduct}
        selectedColor={selectedColor}
        selectedSize={selectedSize}
        quantity={quantity}
        onProductChange={setSelectedProduct}
        onColorChange={setSelectedColor}
        onSizeChange={setSelectedSize}
        onQuantityChange={setQuantity}
      />
    </main>
  )
}
