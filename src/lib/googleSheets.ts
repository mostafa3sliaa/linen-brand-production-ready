import { google } from 'googleapis';

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

function getAuthClient() {
  const email = 'linen-492@mitsh-503601.iam.gserviceaccount.com';
  let key = `-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDoG0/dOBBvsgYg\n/K3FlcMZYc9ASpDOJbyfb5Z+YbPKBq02kRPxsMhOoaxLWgxMMQwyegPA4Nct+pDW\nBmFbLo9nPQFqxKeCj2iq0k3qCnjpGtWTz0mXEPn+hywe6D/tr9NgJRn8fIJOqE5d\neiCI5YCHywDN8RE1Ks2pRjVp8BbTZpoqjU7lHX8XgbHkNIgW06MMOFahO9AHCOh2\nkxiU6xZIG1Lf+ckoY1JxjGJvozm1xd6Ft7toGZ3yEOTUc+oeLFCUPBHV/3Cwrq6+\nd9qs+7ei74tuXW9+N6yaqHI+rbkRBC927sLP4BjnsxXoKUrb0yDqmKVOMBG5omY+\njZA/plOnAgMBAAECggEANKbBaqLFo7jECCaZerk6zR6xZ1mi2IiZ7abgAiJCqQDz\nuO2XExvxjFjDX0J5iK0Vobuo709xsIXm5g4Ddq4srJQbpq8eepDygtF7CCzA+cvz\nB/kdLe4Vb6YVHZu8qLvaXLR93RcXbiVixXSnPbal/efQcmcNaryfc5cwFax3WRO+\nKarWr6QPwbIklKtfakUL20evxlYCQIQd4sQu26EN8d4ga0Cw02FkOoArIUQqipMW\npS025hAVBCs1DSPrSXlYDDcQ9s8TcUay646aPeXVf4Cw89E2Lnj/xMPNJRaykK5y\nTjlESVxC8vKqXZOK2QSZOITKe0b+AM3wZF4xCA3Z2QKBgQD3RP0Z0SDxkDj2e5eL\nl2KuVR95jFvGOUgwSvQpvTODZ9wCF7jacYeArNpjqFmV05AHn5n9Wz5XUyesINKG\n3CAk1v1ZNuL/5zvg8nxPQGeb4/QlZOR39BFPFOIE74vVeM+c/B8zMr1zQ1232RSw\nj7+99STDXfTwM8VaN1cO9TqGyQKBgQDwTUUw9n4/GItk7MBJJCi5irzkG1y3t0ZC\n+T4lcQ/gULfQzkvDMJC65L5L7vdDbA22lvnPzJeVPhr5hAst+QhmOccMWNGUy9tX\nuVd1nXbwi0akTdma7X9CT38nwEmG0wUSPXJDZW/JduEnQs1W4VApAMzmpZmsD4mq\nK7EfCceO7wKBgDsGQNSU0yRWpQJRZk9wB6JNt4GwO4gJzG2atsXv4AgSFrZ5KysZ\nxpq0qDz5xsi5A7yOIJgV27/Ence83gRLL3Eb0MYnD/C+JdEAkSPp39GajIEQoGjx\n3d/ewEUlWV/Pwt9aX6g9CHQnNIvaSdILvl190xS/rORZt1Zdt25eo2XhAoGBAIyN\n1cO+2bcUJyyAIjRl1wA3uyZ9Lq0yoQE5gfUqfYvKCsoycDQaKv12ICyP+MbR4++B\nvVqjI6KisepyJovcVuJcNyXsqaGr338fJJ3h3ZjzDf26n2Y0NjRWBVz95sPal+PE\nVxo+sbUYOLfbJfoETfu9wRvDjvAKIo6Lgc1Szgu3AoGBAJOGJnjQib8MdRTTCRlh\n6Ai2/dAW+eDJ/5Fd74INJgk7kII5n16a6tGypLW9fbitcWf78S9oCiYcKvzfgqdc\nbSw9VqgwoCt79MJsPHdMJ93CFpTU/KdtMs/rnBQP1zrIoYa1mCQd4rq8lNM0CdQh\n330dRjh/8PGqEM8xBDLnq9qx\n-----END PRIVATE KEY-----\n`;
  
  if (!email || !key) return null;
  // Handle escaped newlines in env variables if any
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
  const spreadsheetId = '1KWTEpGeVqQgSLVhV606uKJ3MC_cOlP7iOFBzmShqDk0';

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
      spreadsheetId: '1KWTEpGeVqQgSLVhV606uKJ3MC_cOlP7iOFBzmShqDk0',
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
  const spreadsheetId = '1KWTEpGeVqQgSLVhV606uKJ3MC_cOlP7iOFBzmShqDk0';

  try {
    const rows = await getOrdersFromSheet();
    const rowIndex = rows.findIndex((r: any) => r[0] === orderId); 
    
    if (rowIndex === -1) return false;

    // Status is column L (12th column)
    const range = `Orders!L${rowIndex + 1}`; 

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
