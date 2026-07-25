import { NextResponse } from 'next/server';
import { updateOrderStatus, getOrdersFromSheet } from '@/lib/googleSheets';
import { verifyErpAuth } from '../route';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  if (!verifyErpAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rows = await getOrdersFromSheet();
  const headers = rows[0] || [];
  const orderRow = rows.find((r: any) => r[0] === resolvedParams.id);
  
  if (!orderRow) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  let order: any = {};
  headers.forEach((h: string, i: number) => {
    order[h] = orderRow[i] || "";
  });

  return NextResponse.json({ order });
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  if (!verifyErpAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await req.json();
    if (!data.status) {
      return NextResponse.json({ error: "Status is required" }, { status: 400 });
    }

    const success = await updateOrderStatus(resolvedParams.id, data.status);
    
    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: "Order not found or update failed" }, { status: 404 });
    }
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
