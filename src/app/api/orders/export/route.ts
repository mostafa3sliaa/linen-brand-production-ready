import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { getOrdersFromSheet } from '@/lib/googleSheets';
import { verifyErpAuth } from '../route';

export async function GET(req: Request) {
  try {
    // 1. Fetch from Google Sheets
    const rows = await getOrdersFromSheet();
    const headers = rows[0] || [
      "Order ID", "Date", "Time", "Customer Name", "Phone", "Address", "Items", "Total", "Notes", "Status"
    ];
    let orders = rows.slice(1).map((row: any) => {
      let order: any = {};
      headers.forEach((h: string, i: number) => {
        order[h] = row[i] || "";
      });
      return order;
    });

    // 2. Fetch from Local Queue
    try {
      const queueFile = path.join(process.cwd(), 'failed_orders.json');
      const queueData = await fs.readFile(queueFile, 'utf8');
      const queue = JSON.parse(queueData);
      
      const queuedOrders = queue.map((q: any) => {
        let order: any = {};
        headers.forEach((h: string, i: number) => {
          // payload is an array matching the rowData format
          order[h] = q.payload[i] || "";
        });
        return order;
      });

      orders = [...orders, ...queuedOrders];
    } catch (err) {
      // Ignore if no local queue
    }

    // 3. Convert to CSV format (Excel compatible)
    // UTF-8 BOM is required for Excel to read Arabic characters correctly
    const BOM = '\uFEFF';
    
    let csvContent = BOM + headers.join(',') + '\n';
    
    orders.forEach((order: any) => {
      const row = headers.map(header => {
        let cell = order[header] || "";
        // Escape quotes and wrap in quotes if there are commas
        cell = String(cell).replace(/"/g, '""');
        if (cell.includes(',') || cell.includes('\n') || cell.includes('"')) {
          return `"${cell}"`;
        }
        return cell;
      });
      csvContent += row.join(',') + '\n';
    });

    // 4. Return as a downloadable file
    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="orders_export.csv"',
      },
    });

  } catch (error) {
    console.error("Export Error:", error);
    return NextResponse.json({ error: "Failed to export orders" }, { status: 500 });
  }
}
