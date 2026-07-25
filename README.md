# Luxury Linen Brand API Documentation

This project provides a robust REST API for managing orders. The API uses token-based authentication to secure endpoints.

## Base URL
`/api/orders`

## Authentication
To access protected endpoints (GET, PUT), you must provide the `ERP_API_KEY` defined in the `.env` file. You can provide this in one of two ways:
- Header: `x-api-key: YOUR_KEY`
- Header: `Authorization: Bearer YOUR_KEY`

## Endpoints

### 1. Create a New Order
**Method:** `POST /api/orders`

**Description:** Creates a new order. Triggers Google Sheets logging, WhatsApp notification, and a Webhook (if configured).

**Body:**
```json
{
  "customerName": "John Doe",
  "phone": "01012345678",
  "governorate": "Cairo",
  "city": "Nasr City",
  "address": "123 Main St, Apt 4",
  "productName": "Classic Linen Suit",
  "color": "White",
  "size": "L",
  "quantity": 1,
  "notes": "Call before delivery"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "orderId": "ORD-1629837498234"
}
```

### 2. Fetch All Orders
**Method:** `GET /api/orders`

**Description:** Retrieves all orders from the primary storage (Google Sheets).

**Headers:**
`x-api-key: YOUR_KEY`

**Response (200 OK):**
```json
{
  "orders": [
    {
      "Order ID": "ORD-1629837498234",
      "Customer Name": "John Doe",
      "Status": "New"
      // ... other fields matching Google Sheet headers
    }
  ]
}
```

### 3. Fetch a Single Order
**Method:** `GET /api/orders/:id`

**Description:** Retrieves details of a specific order by ID.

**Headers:**
`x-api-key: YOUR_KEY`

### 4. Update Order Status
**Method:** `PUT /api/orders/:id`

**Description:** Updates the status of an order.

**Headers:**
`x-api-key: YOUR_KEY`

**Body:**
```json
{
  "status": "Shipped"
}
```

## Retry Queue System
If the Google Sheets API or WhatsApp API fails (e.g., due to rate limits or internet issues), the order data is saved locally to `failed_orders.json`. A cron job or manual script can be set up to retry these operations, ensuring zero data loss.
