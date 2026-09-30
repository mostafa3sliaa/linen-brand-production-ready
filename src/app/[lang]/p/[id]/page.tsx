import { notFound } from 'next/navigation';
import ProductLanding from '@/components/Product/ProductLanding';
import Navbar from '@/components/Navbar/Navbar';
import { getStoreConfig } from '@/lib/googleSheets';
import productsData from '@/data/products.json';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface Props {
  params: Promise<{ lang: string; id: string }>;
}

async function getProduct(id: string) {
  try {
    const config = await getStoreConfig();
    const product = config.products.find((p: any) => p.id === id);
    if (product) return product;
  } catch (e) {
    console.error("Error finding product in config:", e);
  }
  return productsData.products.find((p: any) => p.id === id) || null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, id } = await params;
  const isAr = lang === 'ar';
  const product = await getProduct(id);

  if (!product) {
    return {
      title: isAr ? 'المنتج غير موجود | Mitsh' : 'Product Not Found | Mitsh',
    };
  }

  const name = isAr ? product.name.ar : product.name.en;
  const mainImage = product.colors?.[0]?.images?.[0] || 'https://mitsh.vercel.app/images/hero-main.jpg';

  return {
    title: `${name} | Mitsh`,
    description: isAr ? `اطلب الآن ${name} بأفضل جودة وسعر حصري من متجر ميتش.` : `Order ${name} now with premium quality from Mitsh.`,
    openGraph: {
      title: `${name} | Mitsh`,
      description: isAr ? `اطلب الآن ${name} بأفضل جودة وسعر حصري من متجر ميتش.` : `Order ${name} now with premium quality from Mitsh.`,
      images: [{ url: mainImage }],
    },
  };
}

export default async function DynamicProductPage({ params }: Props) {
  const { lang, id } = await params;
  const product = await getProduct(id);

  if (!product) {
    notFound();
  }

  return (
    <>
      <Navbar lang={lang} dict={{}} />
      <main>
        <ProductLanding lang={lang} initialProduct={product} />
      </main>
    </>
  );
}
