import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const mimeType = file.type || 'image/jpeg';
    const filename = file.name || `upload-${Date.now()}.${mimeType.split('/')[1] || 'jpg'}`;

    // Upload directly to Catbox CDN (Permanent, high-speed, free, no API key needed)
    try {
      const uploadForm = new FormData();
      uploadForm.append('reqtype', 'fileupload');
      const blob = new Blob([bytes], { type: mimeType });
      uploadForm.append('fileToUpload', blob, filename);

      const cdnRes = await fetch('https://catbox.moe/user/api.php', {
        method: 'POST',
        body: uploadForm,
      });

      if (cdnRes.ok) {
        const url = (await cdnRes.text()).trim();
        if (url.startsWith('https://')) {
          return NextResponse.json({ url });
        }
      }
    } catch (cdnErr) {
      console.warn("Catbox upload error, trying fallback:", cdnErr);
    }

    // Secondary fallback: Freeimage.host
    try {
      const buffer = Buffer.from(bytes);
      const base64 = buffer.toString('base64');
      const secondaryForm = new FormData();
      secondaryForm.append('key', '6d207e02198a847aa98d0a2a901485a5');
      secondaryForm.append('action', 'upload');
      secondaryForm.append('source', base64);
      secondaryForm.append('format', 'json');

      const secondaryRes = await fetch('https://freeimage.host/api/1/upload', {
        method: 'POST',
        body: secondaryForm,
      });

      if (secondaryRes.ok) {
        const data = await secondaryRes.json();
        if (data?.image?.url) {
          return NextResponse.json({ url: data.image.url });
        }
      }
    } catch (secErr) {
      console.warn("Secondary CDN failed:", secErr);
    }

    return NextResponse.json({ error: "Failed to upload image to CDN" }, { status: 500 });
  } catch (error) {
    console.error("Upload API error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
