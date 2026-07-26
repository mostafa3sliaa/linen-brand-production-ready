const { google } = require('googleapis');

const email = 'linen-492@mitsh-503601.iam.gserviceaccount.com';
let key = `-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDoG0/dOBBvsgYg\n/K3FlcMZYc9ASpDOJbyfb5Z+YbPKBq02kRPxsMhOoaxLWgxMMQwyegPA4Nct+pDW\nBmFbLo9nPQFqxKeCj2iq0k3qCnjpGtWTz0mXEPn+hywe6D/tr9NgJRn8fIJOqE5d\neiCI5YCHywDN8RE1Ks2pRjVp8BbTZpoqjU7lHX8XgbHkNIgW06MMOFahO9AHCOh2\nkxiU6xZIG1Lf+ckoY1JxjGJvozm1xd6Ft7toGZ3yEOTUc+oeLFCUPBHV/3Cwrq6+\nd9qs+7ei74tuXW9+N6yaqHI+rbkRBC927sLP4BjnsxXoKUrb0yDqmKVOMBG5omY+\njZA/plOnAgMBAAECggEANKbBaqLFo7jECCaZerk6zR6xZ1mi2IiZ7abgAiJCqQDz\nuO2XExvxjFjDX0J5iK0Vobuo709xsIXm5g4Ddq4srJQbpq8eepDygtF7CCzA+cvz\nB/kdLe4Vb6YVHZu8qLvaXLR93RcXbiVixXSnPbal/efQcmcNaryfc5cwFax3WRO+\nKarWr6QPwbIklKtfakUL20evxlYCQIQd4sQu26EN8d4ga0Cw02FkOoArIUQqipMW\npS025hAVBCs1DSPrSXlYDDcQ9s8TcUay646aPeXVf4Cw89E2Lnj/xMPNJRaykK5y\nTjlESVxC8vKqXZOK2QSZOITKe0b+AM3wZF4xCA3Z2QKBgQD3RP0Z0SDxkDj2e5eL\nl2KuVR95jFvGOUgwSvQpvTODZ9wCF7jacYeArNpjqFmV05AHn5n9Wz5XUyesINKG\n3CAk1v1ZNuL/5zvg8nxPQGeb4/QlZOR39BFPFOIE74vVeM+c/B8zMr1zQ1232RSw\nj7+99STDXfTwM8VaN1cO9TqGyQKBgQDwTUUw9n4/GItk7MBJJCi5irzkG1y3t0ZC\n+T4lcQ/gULfQzkvDMJC65L5L7vdDbA22lvnPzJeVPhr5hAst+QhmOccMWNGUy9tX\nuVd1nXbwi0akTdma7X9CT38nwEmG0wUSPXJDZW/JduEnQs1W4VApAMzmpZmsD4mq\nK7EfCceO7wKBgDsGQNSU0yRWpQJRZk9wB6JNt4GwO4gJzG2atsXv4AgSFrZ5KysZ\nxpq0qDz5xsi5A7yOIJgV27/Ence83gRLL3Eb0MYnD/C+JdEAkSPp39GajIEQoGjx\n3d/ewEUlWV/Pwt9aX6g9CHQnNIvaSdILvl190xS/rORZt1Zdt25eo2XhAoGBAIyN\n1cO+2bcUJyyAIjRl1wA3uyZ9Lq0yoQE5gfUqfYvKCsoycDQaKv12ICyP+MbR4++B\nvVqjI6KisepyJovcVuJcNyXsqaGr338fJJ3h3ZjzDf26n2Y0NjRWBVz95sPal+PE\nVxo+sbUYOLfbJfoETfu9wRvDjvAKIo6Lgc1Szgu3AoGBAJOGJnjQib8MdRTTCRlh\n6Ai2/dAW+eDJ/5Fd74INJgk7kII5n16a6tGypLW9fbitcWf78S9oCiYcKvzfgqdc\nbSw9VqgwoCt79MJsPHdMJ93CFpTU/KdtMs/rnBQP1zrIoYa1mCQd4rq8lNM0CdQh\n330dRjh/8PGqEM8xBDLnq9qx\n-----END PRIVATE KEY-----\n`;

async function setupSheet() {
  const auth = new google.auth.JWT({
    email,
    key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });

  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '1KWTEpGeVqQgSLVhV606uKJ3MC_cOlP7iOFBzmShqDk0';

  try {
    // First, let's get the current data to see if we need to shift things down
    const getRes = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Orders!A:Z',
    });
    
    let existingValues = getRes.data.values || [];
    
    // Headers to insert
    const headers = [
      "Order ID", "Date", "Time", "Customer Name", "Phone", "Address", "Items", "Total", "Notes", "Status"
    ];

    if (existingValues.length > 0 && existingValues[0][0] !== "Order ID") {
        // Data exists but no headers, prepend headers
        existingValues.unshift(headers);
    } else if (existingValues.length === 0) {
        existingValues = [headers];
    } else {
        console.log("Headers already exist!");
        return;
    }

    // Update the sheet with the new array
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'Orders!A1',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: existingValues,
      },
    });

    console.log("Successfully added headers to the Google Sheet!");
  } catch (error) {
    console.error("Error setting up sheet:", error);
  }
}

setupSheet();
