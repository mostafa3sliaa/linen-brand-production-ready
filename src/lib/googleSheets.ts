import { google } from 'googleapis';

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

function getAuthClient() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  let key = process.env.GOOGLE_PRIVATE_KEY;
  
  if (!email || !key) return null;
  // Handle escaped newlines in env variables
  key = key.replace(/\\n/g, '\n');

  return new google.auth.JWT({
    email,
    key,
    scopes: SCOPES
  });
}

export async function appendOrderToSheet(orderData: any[]) {
  const auth = getAuthClient();
  if (!auth) {
    console.warn("Google Sheets credentials missing. Skipping sheet update.");
    return false;
  }
  
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;

  try {
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Orders!A:Z', // Assuming sheet is named Orders
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [orderData],
      },
    });
    return true;
  } catch (error) {
    console.error("Failed to append to Google Sheets:", error);
    return false;
  }
}

export async function getOrdersFromSheet() {
  const auth = getAuthClient();
  if (!auth) return [];
  const sheets = google.sheets({ version: 'v4', auth });
  try {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: 'Orders!A:Z',
    });
    return res.data.values || [];
  } catch (error) {
    console.error("Error fetching orders:", error);
    return [];
  }
}

export async function updateOrderStatus(orderId: string, status: string) {
  const auth = getAuthClient();
  if (!auth) return false;
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;

  try {
    const rows = await getOrdersFromSheet();
    const rowIndex = rows.findIndex((r: any) => r[0] === orderId); 
    
    if (rowIndex === -1) return false;

    // Assuming Status is column N
    const range = `Orders!N${rowIndex + 1}`; 

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[status]],
      },
    });
    return true;
  } catch (error) {
    console.error("Error updating order:", error);
    return false;
  }
}
