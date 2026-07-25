export async function sendWhatsAppNotification(order: any) {
  const url = process.env.WHATSAPP_API_URL;
  const token = process.env.WHATSAPP_API_TOKEN;
  const to = process.env.WHATSAPP_TARGET_PHONE;

  if (!url || !token || !to) {
    console.warn("WhatsApp credentials missing. Skipping notification.");
    return;
  }

  const message = `
*طلب جديد! 📦*
-------------------
*رقم الطلب:* ${order.orderId}
*الاسم:* ${order.customerName}
*الهاتف:* ${order.phone}
*المحافظة:* ${order.governorate}
*المدينة:* ${order.city}
*العنوان:* ${order.address}

*المنتج:* ${order.productName}
*اللون:* ${order.color}
*المقاس:* ${order.size}
*الكمية:* ${order.quantity}
*ملاحظات:* ${order.notes || '-'}
`;

  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token,
        to,
        body: message,
        priority: 1,
      })
    });
  } catch (error) {
    console.error("Error sending WhatsApp message:", error);
  }
}
