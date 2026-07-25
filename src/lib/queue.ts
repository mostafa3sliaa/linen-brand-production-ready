import fs from 'fs/promises';
import path from 'path';

const QUEUE_FILE = path.join(process.cwd(), 'failed_orders.json');

export async function saveToQueue(taskName: string, payload: any) {
  try {
    let queue: any[] = [];
    try {
      const data = await fs.readFile(QUEUE_FILE, 'utf8');
      queue = JSON.parse(data);
    } catch (err) {
      // File might not exist yet
    }
    
    queue.push({
      id: Date.now().toString(),
      taskName,
      payload,
      timestamp: new Date().toISOString(),
      retries: 0
    });

    await fs.writeFile(QUEUE_FILE, JSON.stringify(queue, null, 2));
    console.log(`Saved task ${taskName} to retry queue.`);
  } catch (error) {
    console.error("Failed to save to retry queue:", error);
  }
}
