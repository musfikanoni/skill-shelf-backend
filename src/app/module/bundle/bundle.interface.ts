import { Types } from "mongoose";

export interface IBundle {
  name: string;
  description?: string;
  price: number;
  products: Types.ObjectId[];
  courses: Types.ObjectId[];
  isActive: boolean;
}