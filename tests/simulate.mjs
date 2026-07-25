import fs from 'fs/promises';

const API_URL = 'http://localhost:3000/api/orders';

async function runTests() {
  console.log('--- STARTING API TESTS ---');
  
  // 1. Missing Data
  console.log('\n[TEST 1] Missing Data (No product/color/size)');
  const res1 = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ customerName: 'Test' }) // missing required fields
  });
  // Since Zod validation is mostly on the client side, our server side API currently just blindly accepts it and inserts it to Google Sheets.
  // WAIT: My API route.ts doesn't have Zod validation! The validation was in OrderForm.tsx! 
  // This is a great finding for the Code Review!
  console.log(`Status: ${res1.status}`);
  const data1 = await res1.json();
  console.log(`Response: ${JSON.stringify(data1)}`);

  // 2. Honeypot (The honeypot is handled on the client side, but let's test Rate Limiting)
  console.log('\n[TEST 2] Rate Limiting (Sending 6 fast requests)');
  let rateLimitHit = false;
  for (let i = 0; i < 6; i++) {
    const r = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customerName: `Spam ${i}` })
    });
    if (r.status === 429) {
      rateLimitHit = true;
      console.log(`Request ${i+1}: Blocked! Status: 429`);
    } else {
      console.log(`Request ${i+1}: Status: ${r.status}`);
    }
  }
  
  // 3. Retry Queue check (Google Sheets requires valid env vars. Since we don't have them, it should fail and save to queue)
  console.log('\n[TEST 3] Google Sheets / WhatsApp Failure Fallback (Retry Queue)');
  try {
    const queueData = await fs.readFile('./failed_orders.json', 'utf8');
    const queue = JSON.parse(queueData);
    console.log(`Queue File Exists! Items in queue: ${queue.length}`);
    console.log(`Sample Queue Item: ${JSON.stringify(queue[0])}`);
  } catch (e) {
    console.log('Queue file not found or empty.');
  }

  console.log('\n--- END OF TESTS ---');
}

runTests();
