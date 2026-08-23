export async function sendTelegramNotification(orderData: any) {
  // Hardcoded for user convenience
  const token = process.env.TELEGRAM_BOT_TOKEN || '8715704404:AAHDk7FsuqaJgUL6lPi7mj00Voch8q-dVkg';
  const chatIds = ['5991792408', '680736426'];
  
  if (!token) {
    return false;
  }

  const itemsString = orderData.items.map((item: any) => {
    const shortName = item.productName.replace('طقم كتان صيفي بريميوم', 'كتان');
    return `${shortName} ${item.color} ${item.size} - الكمية ${item.quantity} - السعر ${item.price}`;
  }).join('\n');

  const total = orderData.items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0) + 50;

  const text = `الاسم: ${orderData.customerName}
الموبايل: ${orderData.phone}
المحافظة: 
العنوان: ${orderData.address}
الشحن: 50
ملاحظات: ${orderData.notes || ""}
المنتجات:
${itemsString}
===`;

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
