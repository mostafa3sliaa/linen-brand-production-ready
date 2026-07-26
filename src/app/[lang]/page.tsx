import ProductLanding from '@/components/Product/ProductLanding';
import Navbar from '@/components/Navbar/Navbar';

export default async function Home({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params;
  return (
    <>
      <Navbar lang={lang} dict={{}} />
      <main>
        <ProductLanding lang={lang} />
      </main>
    </>
  )
}
