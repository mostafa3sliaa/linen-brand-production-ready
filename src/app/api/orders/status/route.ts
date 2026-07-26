import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function PATCH(req: Request) {
  try {
    const { orderIds, status } = await req.json(); // orderIds: string[], status: string
    
    if (!orderIds || !Array.isArray(orderIds)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const queueFile = path.join(process.cwd(), 'failed_orders.json');
    let queueData = "[]";
    try {
      queueData = await fs.readFile(queueFile, 'utf8');
    } catch (e) {
      return NextResponse.json({ error: "No orders found" }, { status: 404 });
    }

    const queue = JSON.parse(queueData);
    let updatedCount = 0;

    const newQueue = queue.map((q: any) => {
      // q.payload is the rowData array. Index 0 is orderId, Index 9 is status
      const orderId = q.payload[0];
      if (orderIds.includes(orderId)) {
        q.payload[9] = status;
        updatedCount++;
      }
      return q;
    });

    if (updatedCount > 0) {
      await fs.writeFile(queueFile, JSON.stringify(newQueue, null, 2));
    }

    // TODO: If you want to also update Google Sheets, you would need to implement 
    // a googleSheets.ts function to update a row based on ID. 
    // For now, updating local queue is sufficient for the dashboard.

    return NextResponse.json({ success: true, updatedCount });
  } catch (error) {
    console.error("Status API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
