import { NextResponse } from 'next/server';
import { appendOrderToSheet, getOrdersFromSheet } from '@/lib/googleSheets';
import { sendWhatsAppNotification } from '@/lib/whatsapp';
import { sendTelegramNotification } from '@/lib/telegram';
import { saveToQueue } from '@/lib/queue';
import { orderSchema } from '@/lib/validations';

// Simple in-memory rate limiting (IP-based)
const rateLimitMap = new Map<string, { count: number, timestamp: number }>();
const WINDOW_MS = 60 * 1000; 
const MAX_REQUESTS = 5; 

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now - record.timestamp > WINDOW_MS) {
    rateLimitMap.set(ip, { count: 1, timestamp: now });
    return false;
  }

  if (record.count >= MAX_REQUESTS) {
    return true;
  }

  record.count += 1;
  return false;
}

export function verifyErpAuth(req: Request) {
  const authHeader = req.headers.get('authorization') || req.headers.get('x-api-key');
  const erpKey = process.env.ERP_API_KEY;
  if (!erpKey) return true;
  return authHeader === erpKey || authHeader === `Bearer ${erpKey}`;
}

export async function POST(req: Request) {
  try {
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    if (isRateLimited(ip)) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const data = await req.json();
    
    // Server-Side Validation
    try {
      orderSchema.parse(data);
    } catch (err: any) {
      return NextResponse.json({ error: err.errors?.[0]?.message || "Invalid data" }, { status: 400 });
    }
    
    const orderId = `ORD-${Date.now()}`;
    const date = new Date().toLocaleDateString('en-GB');
    const time = new Date().toLocaleTimeString('en-GB');
    
    // Format items as a single string for the Excel sheet
    const itemsString = data.items.map((item: any) => 
      `${item.productName} - ${item.color} - Size ${item.size} (x${item.quantity})`
    ).join(' | ');

    const total = data.items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0) + 50; // Adding 50 for shipping

    const rowData = [
      orderId, date, time, 
      data.customerName, data.phone, data.address, 
      itemsString, total, data.notes || "", 
      "New"
    ];

    // Fire webhook if configured
    if (process.env.WEBHOOK_URL) {
      fetch(process.env.WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, ...data })
      }).catch(e => console.error("Webhook failed:", e));
    }

    // Google Sheets with Fallback Queue
    const sheetSuccess = await appendOrderToSheet(rowData);
    if (!sheetSuccess) {
      await saveToQueue("google_sheets_append", rowData);
    }
    
    // WhatsApp Notification
    sendWhatsAppNotification({ orderId, ...data }).catch(async (e) => {
      console.error("WhatsApp failed", e);
      await saveToQueue("whatsapp_notification", { orderId, ...data });
    });

    // Telegram Notification
    sendTelegramNotification(data).catch(e => console.error("Telegram failed", e));

    return NextResponse.json({ success: true, orderId }, { status: 201 });
  } catch (error) {
    console.error("Order API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  if (!verifyErpAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Fetch from Google Sheets
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

  // Fetch from Local Queue (if sheets aren't configured yet)
  try {
    const fs = require('fs/promises');
    const path = require('path');
    const queueFile = path.join(process.cwd(), 'failed_orders.json');
    const queueData = await fs.readFile(queueFile, 'utf8');
    const queue = JSON.parse(queueData);
    
    const queuedOrders = queue.map((q: any) => {
      let order: any = {};
      headers.forEach((h: string, i: number) => {
        order[h] = q.payload[i] || "";
      });
      return order;
    });

    orders = [...orders, ...queuedOrders];
  } catch (err) {
    // No local queue found, ignore
  }

  return NextResponse.json({ orders });
}
