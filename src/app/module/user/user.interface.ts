import { Types } from "mongoose";

export enum Role {
  SUPER_ADMIN = "SUPER_ADMIN",
  ADMIN = "ADMIN",
  USER = "USER",
}

export enum AccountType {
  ORGANIZATION = "ORGANIZATION",
  INDIVIDUAL = "INDIVIDUAL",
  BUSINESS = "BUSINESS"
}
export enum Occupation {
  Carpenter = "Carpenter",
  Electrician = "Electrician",
  Plumber = "Plumber",
  Concretor = "Concretor",
  Painter = "Painter",
  Builder = "Builder",
  Landscaper = "Landscaper",
  Roofer = "Roofer",
  Other = "Other",
}

export interface IAuthProvider {
  provider: "google" | "credentials";
  providerId: string;
}

export enum IsActive {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  BLOCKED = "BLOCKED",
}
export enum SubscriptionStatus {
  CANCELLED = "CANCELLED",
  EXPIRED = "EXPIRED",
  ACTIVE = "ACTIVE",
  TRIAL = "TRIAL",
  PAST_DUE = "PAST_DUE",
}


export interface IUser {
  _id?: Types.ObjectId;
  name: string;
  picture?: string;
  email: string;
  password?: string;
  location?: string;
  // occupation?: Occupation;
  isDeleted?: boolean;
  isActive?: IsActive;
  isVerified?: boolean;
  role: Role;
  // accountType: AccountType;
  auths: IAuthProvider[];
  createdAt?: Date;
  updatedAt?: Date;
  stripeCustomerId?: string | null;

  affiliateCode?: string;
  referredBy?: Types.ObjectId | null;
  totalCommission?: number;
  referredByCode?: string;
  // stripeSubscriptionId?: string | null; 
  // subscriptionStatus?: SubscriptionStatus;
  // trialEndsAt?: Date | null; 
  // currentPlan?: Types.ObjectId;
  // currentPeriodEnd?: Date;
}
