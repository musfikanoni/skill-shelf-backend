import express from "express";
import { CategoryController } from "./category.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
import { parseFormDataMiddleware } from "../../middlewares/parseFormDataMiddleware";
import { FileTypes, upload } from "../../config/cloudinary.config";
import { createCategory, updateCategory } from "./category.validation";

const router = express.Router();

router.post(
  "/",
    upload({
    folder: "CategoryImage",
    fileType: FileTypes.IMAGE,
    maxCount: 1,
  }),
  parseFormDataMiddleware,
  validateRequest(createCategory),
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  CategoryController.createCategory
);

router.get(
  "/",
  // checkAuth(Role.ADMIN, Role.SUPER_ADMIN, Role.USER),
  CategoryController.getAllCategories
);

router.get(
  "/:id",
  // checkAuth(Role.ADMIN, Role.SUPER_ADMIN, Role.USER),
  CategoryController.getSingleCategory
);

router.patch(
  "/:id",
    upload({
    folder: "CategoryImage", // 🆕 new folder
    fileType: FileTypes.IMAGE,
    maxCount: 1,
  }),
  parseFormDataMiddleware,
  validateRequest(updateCategory),
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  CategoryController.updateCategory
);

router.delete(
  "/:id",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  CategoryController.deleteCategory
);

export const CategoryRoutes = router;