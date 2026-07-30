import { NextResponse } from 'next/server';
import { updateOrderStatus } from '@/lib/googleSheets';

export async function PATCH(req: Request) {
  try {
    const { orderIds, status } = await req.json(); // orderIds: string[], status: string
    
    if (!orderIds || !Array.isArray(orderIds)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    let updatedCount = 0;

    for (const orderId of orderIds) {
      const success = await updateOrderStatus(orderId, status);
      if (success) {
        updatedCount++;
      }
    }

    return NextResponse.json({ success: true, updatedCount });
  } catch (error) {
    console.error("Status API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
