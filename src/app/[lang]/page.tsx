"use client";
import { useState, use } from 'react';
import { AnimatePresence } from 'framer-motion';
import Navbar from '@/components/Navbar/Navbar';
import Hero from '@/components/Hero/Hero';
import ProductStory from '@/components/ProductStory/ProductStory';
import Features from '@/components/Features/Features';
import Footer from '@/components/Footer/Footer';
import OrderForm from '@/components/OrderForm/OrderForm';
import productsData from '@/data/products.json';
import arDict from '@/dictionaries/ar.json';
import enDict from '@/dictionaries/en.json';

export default function Home({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = use(params);
  const dict = lang === 'en' ? enDict : arDict;

  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [selectedColor, setSelectedColor] = useState<any | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>("");

  const handleOrderClick = (product: any, color: any, size: string) => {
    setSelectedProduct(product);
    setSelectedColor(color);
    setSelectedSize(size);
    setOrderModalOpen(true);
  };

  return (
    <>
      <Navbar lang={lang} dict={dict} />
      <main>
        <Hero dict={dict} lang={lang} />
        
        <div id="collection">
          {productsData.map((product) => (
            <ProductStory 
              key={product.id}
              product={product}
              dict={dict.products}
              lang={lang}
              onOrderClick={handleOrderClick}
            />
          ))}
        </div>

        <Features lang={lang} />
      </main>
      <Footer lang={lang} />

      <AnimatePresence>
        {orderModalOpen && selectedProduct && (
          <OrderForm 
            product={selectedProduct}
            color={selectedColor}
            size={selectedSize}
            dict={dict}
            lang={lang}
            onClose={() => setOrderModalOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  )
}
