import ProductCard from '../ProductCard/ProductCard';
import styles from './ProductList.module.css';

export default function ProductList({ 
  products,
  dict,
  lang,
  onOrderNow 
}: { 
  products: any[],
  dict: any,
  lang: string,
  onOrderNow: (product: any, color: any, size: string) => void
}) {
  return (
    <section className={styles.productList} id="products">
      <div className={styles.container}>
        <h2 className={styles.sectionTitle}>{dict.title}</h2>
        <div className={styles.grid}>
          {products.map((product) => (
            <ProductCard 
              key={product.id} 
              product={product} 
              dict={dict}
              lang={lang}
              onOrderNow={onOrderNow} 
            />
          ))}
        </div>
      </div>
    </section>
  );
}
