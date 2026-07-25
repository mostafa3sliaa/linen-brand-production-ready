import { z } from 'zod';

export const orderSchema = z.object({
  customerName: z.string().min(3, "Name must be at least 3 characters"),
  phone: z.string().regex(/^01[0125][0-9]{8}$/, "Invalid Egyptian phone number"),
  governorate: z.string().min(2, "Governorate is required"),
  city: z.string().min(2, "City is required"),
  address: z.string().min(5, "Detailed address is required"),
  notes: z.string().optional().default(""),
  productName: z.string().min(1, "Product is required"),
  color: z.string().min(1, "Color is required"),
  size: z.string().min(1, "Size is required"),
  quantity: z.number().min(1, "Quantity must be at least 1")
});
