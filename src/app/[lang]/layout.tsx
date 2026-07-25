import type { Metadata } from 'next'
import { Cairo, Outfit } from 'next/font/google'
import '@/styles/design-tokens.css'
import '../globals.css'

const cairo = Cairo({ subsets: ['arabic', 'latin'], weight: ['300', '400', '500', '700'], variable: '--font-cairo' })
const outfit = Outfit({ subsets: ['latin'], weight: ['300', '400', '500', '700'], variable: '--font-outfit' })

export const metadata: Metadata = {
  title: 'Mitsh | ميتش',
  description: 'اكتشف مجموعتنا الحصرية من ميتش. Discover our exclusive Mitsh collection.',
}

export async function generateStaticParams() {
  return [{ lang: 'ar' }, { lang: 'en' }];
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const isRtl = lang === 'ar';
  
  return (
    <html lang={lang} dir={isRtl ? 'rtl' : 'ltr'}>
      <body className={`${cairo.variable} ${outfit.variable} ${isRtl ? cairo.className : outfit.className}`}>
        {children}
      </body>
    </html>
  )
}
