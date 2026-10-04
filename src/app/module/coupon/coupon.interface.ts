export interface ICoupon {
  code: string;
  discountType: "PERCENTAGE" | "FLAT";
  discountValue: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  expiresAt: Date;
  isActive: boolean;
}