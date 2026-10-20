import express from "express";
import { ProductController } from "./product.controller";
import { createProduct, updateProduct } from "./product.validation";
import { validateRequest } from "../../middlewares/validateRequest";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
import { FileTypes, upload } from "../../config/cloudinary.config";
import { parseFormDataMiddleware } from "../../middlewares/parseFormDataMiddleware";

const router = express.Router();

router.post(
  "/",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),

  upload({
    folder: "products",
    fileType: FileTypes.ANY,
    fields: [
      { name: "images", maxCount: 5 },
      { name: "basicFile", maxCount: 1 },
      { name: "proFile", maxCount: 1 },
      { name: "vipFile", maxCount: 1 },
    ],
  }),

  parseFormDataMiddleware,
  validateRequest(createProduct),
  ProductController.createProduct
);

router.get(
  "/",
  // checkAuth(Role.ADMIN, Role.SUPER_ADMIN, Role.USER),
  ProductController.getAllProducts);

router.get(
  "/my-all-product",
  checkAuth(Role.USER),
  // checkPlanAccess("PRODUCT"),
  ProductController.getMyUnlockedProducts
);
router.get(
  "/my-product/:id",
  checkAuth(Role.USER),
  // checkPlanAccess("PRODUCT"),
  ProductController.getUnlockSingleProduct
);

router.get(
  "/id/:id",
  // checkAuth(Role.ADMIN, Role.SUPER_ADMIN, Role.USER),
  ProductController.getSingleProduct
);



router.patch(
  "/:id",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  upload({
    folder: "products",
    fileType: FileTypes.ANY,
    fields: [
      { name: "images", maxCount: 5 },
      { name: "basicFile", maxCount: 1 },
      { name: "proFile", maxCount: 1 },
      { name: "vipFile", maxCount: 1 },
    ],
  }),
  parseFormDataMiddleware,
  validateRequest(updateProduct),
  ProductController.updateProduct
);
router.delete(
  "/:id",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  ProductController.deleteProduct
);

export const ProductRoutes = router;