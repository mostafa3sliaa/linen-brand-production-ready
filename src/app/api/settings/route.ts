import { NextResponse } from 'next/server';
import { getStoreConfig, saveStoreConfig } from '@/lib/googleSheets';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const config = await getStoreConfig();
    return NextResponse.json({ settings: config.settings });
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json({
      settings: {
        fbPixelId: process.env.NEXT_PUBLIC_FB_PIXEL_ID || '1726555298615011',
        tiktokPixelId: process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID || 'D9INTRJC77U820ARL2J0',
        snapPixelId: ''
      }
    });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { settings } = body;

    if (!settings || typeof settings !== 'object') {
      return NextResponse.json({ error: "Invalid settings payload" }, { status: 400 });
    }

    // Helper to extract clean ID if user pasted full URL or snippet
    const cleanId = (val: string) => {
      if (!val) return '';
      const trimmed = val.trim();
      // If it contains digits like 1726555298615011
      const match = trimmed.match(/\b\d{10,20}\b/);
      if (match) return match[0];
      return trimmed;
    };

    const sanitizedSettings = {
      ...settings,
      fbPixelId: cleanId(settings.fbPixelId || ''),
      tiktokPixelId: (settings.tiktokPixelId || '').trim(),
      snapPixelId: (settings.snapPixelId || '').trim(),
    };

    const success = await saveStoreConfig({ settings: sanitizedSettings });
    return NextResponse.json({ success, settings: sanitizedSettings });
  } catch (error) {
    console.error("Error saving settings:", error);
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 });
  }
}
