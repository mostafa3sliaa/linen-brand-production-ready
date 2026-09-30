import { NextResponse } from 'next/server';
import { getStoreConfig, saveStoreConfig } from '@/lib/googleSheets';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const config = await getStoreConfig();
    return NextResponse.json({ products: config.products });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json({ products: [] });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { product } = body;

    if (!product || !product.id || !product.name) {
      return NextResponse.json({ error: "Missing required product fields" }, { status: 400 });
    }

    const config = await getStoreConfig();
    const existingProducts = config.products || [];

    // Check if updating existing or adding new
    const existingIndex = existingProducts.findIndex((p: any) => p.id === product.id);
    let updatedProducts = [...existingProducts];

    if (existingIndex >= 0) {
      updatedProducts[existingIndex] = { ...updatedProducts[existingIndex], ...product };
    } else {
      updatedProducts.push(product);
    }

    const success = await saveStoreConfig({ products: updatedProducts });
    if (!success) {
      return NextResponse.json({ error: "تعذر الحفظ في قاعدة البيانات، يرجى المحاولة مرة أخرى" }, { status: 500 });
    }
    return NextResponse.json({ success: true, products: updatedProducts });
  } catch (error) {
    console.error("Error saving product:", error);
    return NextResponse.json({ error: "Failed to save product" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: "Product id is required" }, { status: 400 });
    }

    const config = await getStoreConfig();
    const existingProducts = config.products || [];

    // Don't allow deleting if only 1 product left
    if (existingProducts.length <= 1) {
      return NextResponse.json({ error: "لا يمكن حذف المنتج الأساسي الوحيد المتبقي" }, { status: 400 });
    }

    const updatedProducts = existingProducts.filter((p: any) => p.id !== id);
    const success = await saveStoreConfig({ products: updatedProducts });

    return NextResponse.json({ success, products: updatedProducts });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
