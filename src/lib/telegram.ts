export async function sendTelegramNotification(orderData: any) {
  // Hardcoded for user convenience
  const token = process.env.TELEGRAM_BOT_TOKEN || '8715704404:AAHDk7FsuqaJgUL6lPi7mj00Voch8q-dVkg';
  const chatIds = ['5991792408', '680736426'];
  
  if (!token) {
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
    await Promise.all(chatIds.map(chatId =>
      fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: text,
        }),
      })
    ));
    return true;
  } catch (error) {
    console.error("Telegram fetch error:", error);
    return false;
  }
}
