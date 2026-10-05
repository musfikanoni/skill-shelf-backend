import AppError from "../../errorHelpers/AppError";
import { getFilesByTier } from "../../utils/getFileByTier";
import { QueryBuilder } from "../../utils/QueryBuiler";
import { Bundle } from "../bundle/bundle.model";
import { Payment } from "../payment/payment.model";
import { Subscription } from "../subscription/subscription.model";
import { IProduct } from "./product.interface";
import { Product } from "./product.model";
import httpStatus from "http-status-codes";
import { SubscriptionStatus } from "../user/user.interface";
const resolveProductAccess = (
  productId: string,
  payments: any[],
  bundleItems: any[],
  subscription: any
) => {

const productPayments = payments
  .filter(p => p.itemId.toString() === productId)
  .sort(
    (a, b) =>
      new Date(b.createdAt).getTime() -
      new Date(a.createdAt).getTime()
  );

const payment = productPayments[0];

  if (payment) {
    return {
      isPurchased: true,
      source: "ORDER",
      plan: payment.planType,
    };
  }

  // 2️⃣ BUNDLE
  const bundle = bundleItems.find(
    (b) => b.product.toString() === productId
  );

  if (bundle) {
    return {
      isPurchased: true,
      source: "BUNDLE",
      plan: bundle.fileAccess || "basic",
    };
  }

  // 3️⃣ SUBSCRIPTION
  const matched = subscription?.plan?.access?.products?.find(
    (p: any) => p.product.toString() === productId
  );

  if (matched) {
    return {
      isPurchased: true,
      source: "SUBSCRIPTION",
      plan: matched.fileAccess,
    };
  }

  return {
    isPurchased: false,
    source: null,
    plan: null,
  };
};
const createProduct = async (payload: IProduct) => {
  const result = await Product.create(payload);
  return result;
}

// const getAllProducts = async (query: Record<string, string>) => {
//   const modifiedQuery: any = { ...query };

//   // 🔥 PRICE RANGE FILTER
//   if (query.priceRange && query.priceRange !== "all") {
//     switch (query.priceRange) {
//   case "under-50":
//     modifiedQuery["price.basic"] = { $lt: 50 };
//     break;

//   case "51-100":
//     modifiedQuery["price.basic"] = { $gte: 51, $lte: 100 };
//     break;

//   case "100-plus":
//     modifiedQuery["price.basic"] = { $gt: 100 };
//     break;
// }

//     delete modifiedQuery.priceRange;
//   }

//   // 🔥 RATING FILTER (FIXED)
//   if (query.ratingFilter && query.ratingFilter !== "all") {
//     switch (query.ratingFilter) {
//       case "4-plus":
//         modifiedQuery.averageRating = { $gte: 4 };
//         break;

//       case "4.5-plus":
//         modifiedQuery.averageRating = { $gte: 4.5 };
//         break;
//     }

//     delete modifiedQuery.ratingFilter;
//   }

//   const productQuery = new QueryBuilder(Product.find(), modifiedQuery)
//     .filter()
//     .search(["name"])
//     .sort()
//     .paginate()
//     .build();

//   const result = await productQuery.populate("category");

//   return result;
// };


const getAllProducts = async (query: Record<string, string>) => {
  const modifiedQuery: any = { ...query };

  // PRICE FILTER
  if (query.priceRange && query.priceRange !== "all") {
    switch (query.priceRange) {
      case "under-50":
        modifiedQuery["price.basic"] = { $lt: 50 };
        break;

      case "51-100":
        modifiedQuery["price.basic"] = { $gte: 51, $lte: 100 };
        break;

      case "100-plus":
        modifiedQuery["price.basic"] = { $gt: 100 };
        break;
    }

    delete modifiedQuery.priceRange;
  }

  // RATING FILTER
  if (query.ratingFilter && query.ratingFilter !== "all") {
    switch (query.ratingFilter) {
      case "4-plus":
        modifiedQuery.averageRating = { $gte: 4 };
        break;

      case "4.5-plus":
        modifiedQuery.averageRating = { $gte: 4.5 };
        break;
    }

    delete modifiedQuery.ratingFilter;
  }

  // =========================
  // QUERY BUILDER
  // =========================
  const productQuery = new QueryBuilder(Product.find(), modifiedQuery)
    .filter()
    .search(["name"])
    .sort()
    .fields()
    .paginate();

  const data = await productQuery.build().populate("category");

  const meta = await productQuery.getMeta();

  return {
    data,
    meta,
  };
};

const getSingleProduct = async (id: string) => {
  const product = await Product.findById(id).populate("category").select("-files");

  if (!product) {
    throw new AppError(httpStatus.NOT_FOUND, "Product not found");
  }

  return {
    data: {
      ...product.toObject()
    }
  };
};

const getMyUnlockedProducts = async (
  userId: string,
  query: Record<string, string>
) => {
  const searchTerm = query.searchTerm || "";

  const [products, payments, subscription, bundles] = await Promise.all([
    Product.find({
      ...(searchTerm && {
        name: { $regex: searchTerm, $options: "i" }
      })
    }).populate("category"),

    Payment.find({
      user: userId,
      status: "PAID",
      itemType: "PRODUCT"
    }),

    Subscription.findOne({
      user: userId,
      status: SubscriptionStatus.ACTIVE
    }).populate("plan"),

    Bundle.find({ user: userId })
  ]);

  return products
    .map((product) => {
      const access = resolveProductAccess(
        product._id.toString(),
        payments,
        bundles,
        subscription
      );

      if (!access.isPurchased) return null;

      return {
        ...product.toObject(),
        files: getFilesByTier(product, access.plan),
        isPurchased: true,
        accessSource: access.source
      };
    })
    .filter(Boolean);
};

const updateProduct = async (id: string, payload: Partial<IProduct>) => {

  delete payload.averageRating;
  delete payload.totalReviews;

  const result = await Product.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true
  });

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, "Product not found");
  }

  return result;
};

const deleteProduct = async (id: string) => {
  const result = await Product.findByIdAndDelete(id);
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, "Product not found");
  }
  return result;
};



const getUnlockSingleProduct = async (id: string, userId: string) => {
  const product = await Product.findById(id).populate("category");

  if (!product) {
    throw new AppError(httpStatus.NOT_FOUND, "Product not found");
  }

  const [payment, subscription, bundle] = await Promise.all([
    Payment.findOne({ user: userId, itemId: id, status: "PAID" }),
    Subscription.findOne({ user: userId, status: SubscriptionStatus.ACTIVE }).populate("plan"),
    Bundle.findOne({ user: userId, product: id })
  ]);

  const access = resolveProductAccess(
    id,
    payment ? [payment] : [],
    bundle ? [bundle] : [],
    subscription
  );

  if (!access.isPurchased) {
    return {
      ...product.toObject(),
      files: null,
      isPurchased: false,
      accessSource: null,
    };
  }

  return {
    ...product.toObject(),
    files: getFilesByTier(product, access.plan),
    isPurchased: true,
    accessSource: access.source,
  };
};

export const ProductService = {
  createProduct,
  getAllProducts,
  getMyUnlockedProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  getUnlockSingleProduct,
};