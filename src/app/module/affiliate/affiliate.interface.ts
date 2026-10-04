import { Types } from "mongoose";

export interface IAffiliateInfo {
  affiliateCode?: string;
  referredBy?: Types.ObjectId | null;
  totalCommission?: number;
}

export enum CommissionStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECT = "REJECT",
}

export interface IAffiliate {
  user: Types.ObjectId;
  referredUser: Types.ObjectId;
  amount: number;
  status: CommissionStatus;
  createdAt?: Date;
  updatedAt?: Date;
}