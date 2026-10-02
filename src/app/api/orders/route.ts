import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { appendOrderToSheet, getOrdersFromSheet } from '@/lib/googleSheets';
import { sendTelegramNotification } from '@/lib/telegram';
import { sendWhatsAppNotification } from '@/lib/whatsapp';
import { saveToQueue } from '@/lib/queue';
import { orderSchema, normalizeEgyptianPhone } from '@/lib/validations';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Simple in-memory rate limiting (IP-based)
const rateLimitMap = new Map<string, { count: number, timestamp: number }>();
const WINDOW_MS = 60 * 1000; 
const MAX_REQUESTS = 30; 

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
      return NextResponse.json({ error: "تم إرسال عدة طلبات في وقت قصير، يرجى الانتظار دقيقة والمحاولة مجدداً." }, { status: 429 });
    }

    const data = await req.json();
    
    // Clean and normalize incoming data before validation
    if (data.phone) {
      data.phone = normalizeEgyptianPhone(String(data.phone));
    }
    if (data.customerName) {
      data.customerName = String(data.customerName).trim();
    }
    if (data.address) {
      data.address = String(data.address).trim();
    }
    if (data.governorate) {
      data.governorate = String(data.governorate).trim();
    }
    if (Array.isArray(data.items)) {
      data.items = data.items.map((it: any) => ({
        productName: typeof it.productName === 'string' ? it.productName.trim() : (it.productName?.ar || it.productName?.en || 'منتج'),
        color: typeof it.color === 'string' ? it.color.trim() : (it.color?.ar || it.color?.en || 'افتراضي'),
        size: typeof it.size === 'string' ? it.size.trim() : 'Free Size',
        quantity: Number(it.quantity) || 1,
        price: Number(it.price) || 0
      }));
    }

    // Server-Side Validation
    try {
      orderSchema.parse(data);
    } catch (err: any) {
      return NextResponse.json({ error: err.errors?.[0]?.message || "بيانات الطلب غير مكتملة، يرجى التأكد من ملء الحقول المطلوبة." }, { status: 400 });
    }
    
    const orderId = `ORD-${Date.now()}`;
    const date = new Date().toLocaleDateString('en-GB');
    const time = new Date().toLocaleTimeString('en-GB');
    
    const itemsString = data.items.map((item: any) => {
      const pName = String(item.productName || 'منتج').replace('طقم كتان بريميوم', 'كتان');
      const pColor = item.color ? ` - لون ${item.color}` : '';
      const pSize = item.size ? ` - مقاس ${item.size}` : '';
      return `${pName}${pColor}${pSize} (الكمية: ${item.quantity || 1}, السعر: ${item.price} ج)`;
    }).join('\n');

    const productsTotal = data.items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
    const shippingFee = typeof data.shippingFee === 'number' 
      ? data.shippingFee 
      : (typeof data.shipping === 'number' 
          ? data.shipping 
          : (Number(data.shippingFee ?? data.shipping) || 50));
    const finalTotal = productsTotal + shippingFee;

    const rowData = [
      orderId, 
      `${date} ${time}`,
      data.customerName,
      data.phone,
      data.governorate,
      data.address,
      itemsString,
      productsTotal,
      shippingFee,
      finalTotal,
      data.notes || "",
      "New" // الحالة
    ];

    // Fire webhook if configured
    if (process.env.WEBHOOK_URL) {
      fetch(process.env.WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, shippingFee, finalTotal, ...data })
      }).catch(e => console.error("Webhook failed:", e));
    }

    // Google Sheets with Fallback Queue
    const sheetSuccess = await appendOrderToSheet(rowData);
    if (!sheetSuccess) {
      await saveToQueue("google_sheets_append", rowData);
    }
    
    // WhatsApp Notification
    await sendWhatsAppNotification({ orderId, shippingFee, finalTotal, ...data }).catch(async (e) => {
      console.error("WhatsApp failed", e);
      await saveToQueue("whatsapp_notification", { orderId, shippingFee, finalTotal, ...data });
    });

    // Telegram Notification
    await sendTelegramNotification({ ...data, shippingFee, finalTotal }).catch(e => console.error("Telegram failed", e));

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
