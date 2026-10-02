import { z } from 'zod';

export function normalizeEgyptianPhone(input: string): string {
  if (!input) return '';
  const arabicNumerals = ['٠','١','٢','٣','٤','٥','٦','٧','٨','٩'];
  let clean = String(input).trim();
  for (let i = 0; i < 10; i++) {
    clean = clean.split(arabicNumerals[i]).join(String(i));
  }
  clean = clean.replace(/[^0-9+]/g, '');
  if (clean.startsWith('+20')) clean = '0' + clean.slice(3);
  else if (clean.startsWith('0020')) clean = '0' + clean.slice(4);
  else if (clean.startsWith('20') && clean.length === 12) clean = '0' + clean.slice(2);
  else if (!clean.startsWith('0') && clean.length === 10 && clean.startsWith('1')) clean = '0' + clean;
  return clean;
}

export const orderSchema = z.object({
  customerName: z.string().min(2, "يرجى كتابة الاسم بالكامل"),
  phone: z.string().refine(val => {
    const norm = normalizeEgyptianPhone(val);
    return /^01[0125][0-9]{8}$/.test(norm) || /^[0-9]{10,14}$/.test(norm);
  }, { message: "يرجى كتابة رقم موبايل مصري صحيح (مثال: 01012345678)" }),
  address: z.string().min(3, "يرجى كتابة العنوان بالتفصيل"),
  notes: z.string().optional().default(""),
  governorate: z.string().optional().default(""),
  shippingFee: z.number().optional(),
  shipping: z.number().optional(),
  items: z.array(z.object({
    productName: z.string().default("منتج"),
    color: z.string().default("افتراضي"),
    size: z.string().default("Free Size"),
    quantity: z.number().default(1),
    price: z.number().default(0)
  })).min(1, "يجب أن تحتوي السلة على منتج واحد على الأقل")
});
