import { Types } from "mongoose";

export interface ICourse {
  title: string;
  description: string;
  thumbnail: string;
category: Types.ObjectId;
  price: number;
  averageRating?: number;   
  totalReviews?: number; 

  isPublished: boolean;

  createdBy: Types.ObjectId;
}