import ProductLanding from '@/components/Product/ProductLanding';
import Navbar from '@/components/Navbar/Navbar';
import { getStoreConfig } from '@/lib/googleSheets';
import productsData from '@/data/products.json';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Home({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params;
  let products = productsData.products;
  try {
    const config = await getStoreConfig();
    if (config?.products && config.products.length > 0) {
      products = config.products;
    }
  } catch (e) {
    console.error("Error loading products on homepage:", e);
  }

  const isAr = lang === 'ar';
  const mainProduct = products[0];
  const otherProducts = products.slice(1);

  return (
    <>
      <Navbar lang={lang} dict={{}} />
      <main>
        {/* If multiple products exist, show a top switcher bar */}
        {otherProducts.length > 0 && (
          <div style={{
            background: 'linear-gradient(90deg, #111 0%, #222 100%)',
            color: '#fff',
            padding: '12px 16px',
            textAlign: 'center',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            flexWrap: 'wrap',
            borderBottom: '1px solid rgba(255,255,255,0.1)'
          }}>
            <span style={{ fontWeight: 600 }}>🛍️ {isAr ? 'تشكيلة منتجاتنا:' : 'Our Collection:'}</span>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
              {products.map((p: any) => (
                <Link
                  key={p.id}
                  href={`/${lang}/p/${p.id}`}
                  style={{
                    color: p.id === mainProduct.id ? '#111' : '#fff',
                    textDecoration: 'none',
                    background: p.id === mainProduct.id ? '#e5d3b3' : 'rgba(255,255,255,0.12)',
                    padding: '4px 14px',
                    borderRadius: '20px',
                    fontWeight: 600,
                    transition: 'all 0.2s ease',
                    boxShadow: p.id === mainProduct.id ? '0 2px 8px rgba(229, 211, 179, 0.4)' : 'none'
                  }}
                >
                  {isAr ? p.name.ar : p.name.en}
                </Link>
              ))}
            </div>
          </div>
        )}
        <ProductLanding lang={lang} initialProduct={mainProduct} />
      </main>
    </>
  );
}
