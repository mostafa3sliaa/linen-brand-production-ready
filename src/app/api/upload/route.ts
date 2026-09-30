import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Convert file to buffer and base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString('base64');
    const mimeType = file.type || 'image/jpeg';

    // Try uploading to high-speed free image hosting CDN
    try {
      const uploadForm = new FormData();
      uploadForm.append('key', '6d207e02198a847aa98d0a2a901485a5');
      uploadForm.append('action', 'upload');
      uploadForm.append('source', base64);
      uploadForm.append('format', 'json');

      const cdnRes = await fetch('https://freeimage.host/api/1/upload', {
        method: 'POST',
        body: uploadForm,
      });

      if (cdnRes.ok) {
        const cdnData = await cdnRes.json();
        if (cdnData?.image?.url) {
          return NextResponse.json({ url: cdnData.image.url });
        }
      }
    } catch (cdnErr) {
      console.warn("Freeimage.host upload failed, falling back to data URL:", cdnErr);
    }

    // Fallback directly to optimized data URL
    const dataUrl = `data:${mimeType};base64,${base64}`;
    return NextResponse.json({ url: dataUrl });
  } catch (error) {
    console.error("Upload API error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
