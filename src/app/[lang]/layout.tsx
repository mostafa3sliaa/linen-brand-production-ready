import type { Metadata } from 'next'
import { Cairo, Outfit } from 'next/font/google'
import '@/styles/design-tokens.css'
import '../globals.css'
import PixelScripts from '@/components/PixelScripts'

const cairo = Cairo({ subsets: ['arabic', 'latin'], weight: ['300', '400', '500', '700'], variable: '--font-cairo' })
const outfit = Outfit({ subsets: ['latin'], weight: ['300', '400', '500', '700'], variable: '--font-outfit' })

export const metadata: Metadata = {
  title: 'Mitsh | طقم كتان صيفي بريميوم',
  description: 'اكتشف مجموعتنا الحصرية من ميتش. طقم كتان صيفي بريميوم بأفضل خامة وألوان جذابة.',
  keywords: 'طقم كتان, ملابس صيفية, ميتش, Mitsh, ملابس رجالي, ملابس حريمي, أطقم كاجوال',
  openGraph: {
    title: 'Mitsh | طقم كتان صيفي بريميوم',
    description: 'طقم كتان صيفي بريميوم بخامة ممتازة وألوان جذابة. اطلب الآن من ميتش!',
    url: 'https://mitsh.vercel.app',
    siteName: 'Mitsh',
    images: [
      {
        url: 'https://mitsh.vercel.app/images/hero-main.jpg',
        width: 1200,
        height: 630,
        alt: 'Mitsh Summer Collection',
      }
    ],
    locale: 'ar_EG',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mitsh | ميتش',
    description: 'طقم كتان صيفي بريميوم بخامة ممتازة وألوان جذابة.',
    images: ['https://mitsh.vercel.app/images/hero-main.jpg'],
  }
}

export const viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
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
        <PixelScripts />
      </body>
    </html>
  )
}
