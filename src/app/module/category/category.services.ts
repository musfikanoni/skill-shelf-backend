import { Category } from "./category.model";
import { ICategory } from "./category.interface";

const createCategory = async (payload: ICategory) => {
  const result = await Category.create(payload);
  return result;
};

const getAllCategories = async () => {
  const result = await Category.find().sort({ createdAt: -1 });
  return result;
};

const getSingleCategory = async (id: string) => {
  const result = await Category.findById(id);
  return result;
};

const updateCategory = async (id: string, payload: Partial<ICategory>) => {
  const result = await Category.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true
  });
  return result;
};

const deleteCategory = async (id: string) => {
  const result = await Category.findByIdAndDelete(id);
  return result;
};

export const CategoryService = {
  createCategory,
  getAllCategories,
  getSingleCategory,
  updateCategory,
  deleteCategory
};