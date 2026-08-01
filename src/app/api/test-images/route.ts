import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const imagesDir = path.join(process.cwd(), 'public', 'images');
    const files = fs.readdirSync(imagesDir);
    return NextResponse.json({ files, cwd: process.cwd(), imagesDir });
  } catch (error: any) {
    return NextResponse.json({ error: error.message, cwd: process.cwd() });
  }
}
