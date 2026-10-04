import { Types } from "mongoose";

export interface IProduct {
  name: string;
  category: Types.ObjectId;
  price: {
    basic: number;
    pro: number;
    vip: number;
  };
  images: string[];
  files: {
    basic?: string | null;
    pro?: string | null;
    vip?: string | null;
  };
  averageRating?: number;
  totalReviews?: number;
}