export async function sendTelegramNotification(orderData: any) {
  // We will hardcode these once the user provides them
  const token = process.env.TELEGRAM_BOT_TOKEN || '';
  const chatId = process.env.TELEGRAM_CHAT_ID || '';
  
  if (!token || !chatId) {
    return false;
  }

  const itemsString = orderData.items.map((item: any) => 
    `- ${item.productName} (${item.color}, Size: ${item.size}) x${item.quantity} [${item.price * item.quantity} EGP]`
  ).join('\n');

  const total = orderData.items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0) + 50;

  const text = `
🛒 *طلب جديد (New Order!)* 🛒

👤 *الاسم:* ${orderData.customerName}
📱 *الموبايل:* ${orderData.phone}
📍 *العنوان:* ${orderData.address}

📦 *المنتجات:*
${itemsString}

🚚 *الشحن:* 50 EGP
💰 *الإجمالي:* ${total} EGP

📝 *ملاحظات:* ${orderData.notes || 'لا يوجد'}
  `;

  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: 'Markdown',
      }),
    });
    
    if (!response.ok) {
        console.error("Telegram error:", await response.text());
        return false;
    }
    return true;
  } catch (error) {
    console.error("Telegram fetch error:", error);
    return false;
  }
}
