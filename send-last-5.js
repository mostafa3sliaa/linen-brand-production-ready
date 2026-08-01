const token = '8715704404:AAHDk7FsuqaJgUL6lPi7mj00Voch8q-dVkg';
const chatIds = ['5991792408', '680736426'];

async function sendOrders() {
  const res = await fetch('https://mitsh.vercel.app/api/orders');
  const data = await res.json();
  const orders = data.orders || [];
  
  // Get the last 5 orders
  const lastOrders = orders.slice(-5);

  for (const order of lastOrders) {
    const text = `
🛒 <b>طلب (إعادة إرسال)</b> 🛒

👤 <b>الاسم:</b> ${order['Customer Name']}
📱 <b>الموبايل:</b> ${order['Phone']}
📍 <b>العنوان:</b> ${order['Address']}

📦 <b>المنتجات:</b>
${order['Items'].split(' | ').map(item => `- ${item}`).join('\n')}

💰 <b>الإجمالي:</b> ${order['Total']} EGP

📝 <b>ملاحظات:</b> ${order['Notes'] || 'لا يوجد'}
    `;

    for (const chatId of chatIds) {
      await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: text,
          parse_mode: 'HTML'
        })
      });
    }
    console.log('Resent order:', order['Customer Name']);
  }
  console.log('Done!');
}

sendOrders().catch(console.error);
