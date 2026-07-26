import { z } from 'zod';

export const orderSchema = z.object({
  customerName: z.string().min(3, "Name must be at least 3 characters"),
  phone: z.string().regex(/^01[0125][0-9]{8}$/, "Invalid Egyptian phone number"),
  address: z.string().min(5, "Detailed address is required"),
  notes: z.string().optional().default(""),
  items: z.array(z.object({
    productName: z.string(),
    color: z.string(),
    size: z.string(),
    quantity: z.number(),
    price: z.number()
  })).min(1, "Order must contain at least 1 item")
});
