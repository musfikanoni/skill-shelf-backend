
import httpStatus from "http-status-codes";
import { envVars } from "../../config/env";
import AppError from "../../errorHelpers/AppError";
import { IUser, Role, SubscriptionStatus } from "./user.interface";
import { User } from "./user.model";
import { userSearchableFields } from "./user.constant";
import { JwtPayload } from "jsonwebtoken";
import bcryptjs from 'bcryptjs';
// import { Subscription } from "../subscription/subscription.model";
// import { Payment } from "../payment/payment.model";
// import { Bundle } from "../bundle/bundle.model";
// import { getFilesByTier } from "../../utils/getFileByTier";
// import { Product } from "../product/product.model";
// import { Course } from "../courses/courses.model";
// import { IPlan } from "../plan/plan.interface";
import { nanoid } from "nanoid";
import { QueryBuilder } from "../../utils/QueryBuiler";
import { generateOtp } from "../otp/otp.service";
import { redisClient } from "../../config/redis.config";
import { sendEmail } from "../../utils/sendEmail";
import { deleteFileFromS3 } from "../../config/S3Client.config";

const createUser = async (payload: Partial<IUser>) => {
  const { email, password, referredByCode, ...rest } = payload;

  const isUserExist = await User.findOne({ email });

  if (isUserExist) {
    throw new AppError(httpStatus.BAD_REQUEST, "User Already Exist");
  }

  const hashedPassword = await bcryptjs.hash(
    password as string,
    Number(envVars.BCRYPT_SALT_ROUND)
  );

    const affiliateCode = nanoid(8);

  let referredByUser = null;

  if (referredByCode) {
    referredByUser = await User.findOne({
      affiliateCode: referredByCode,
    });

    if (!referredByUser) {
      throw new AppError(400, "Invalid referral code");
    }
  }


  const user = await User.create({
    email,
    password: hashedPassword,
    affiliateCode,
    referredBy: referredByUser?._id || null,
    ...rest
  });

  
  if (!user) {
    throw new AppError(httpStatus.BAD_REQUEST, "Failed to register user");
  }


  const redisKey = `otp:${email}`;
  const otp = generateOtp();

  await redisClient.set(redisKey, otp, {
    expiration: { type: "EX", value: 120 },
  });

  await sendEmail({
    to: email,
    subject: "Account Verification OTP",
    templateName: "otp",
    templateData: {
      name: user.name,
      otp,
    },
  });

  return { user };
};

const getAllUsers = async (query: Record<string, string>) => {
  const queryBuilder = new QueryBuilder(User.find(), query);
  const usersData = queryBuilder
    .filter()
    .search(userSearchableFields)
    .sort()
    .fields()
    .paginate();

  const [data, meta] = await Promise.all([
    usersData.build(),
    queryBuilder.getMeta(),
  ]);

  return {
    data,
    meta,
  };
};


const getMe = async (userId: string) => {
  const user = await User.findById(userId).select("-password");
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

    // =========================
  // 🔥 GET ACTIVE SUBSCRIPTION
  // ========================= /n
//   const subscription = await Subscription.findOne({
//     user: userId,
//   }).sort({ createdAt: -1 }); 

//   const response = {
//     ...user.toObject(),

//     currentPeriodEnd: subscription?.currentPeriodEnd || null,
//   };

//   return {
//     data: response,
//   };
};


const getSingleUser = async (id: string) => {
  const user = await User.findById(id).select("-password");
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  return {
    data: {
      ...user.toObject()
    }
  };
};

const updateUser = async (userId: string, payload: Partial<IUser>, decodedToken: JwtPayload) => {

  if (decodedToken.role === Role.USER) {
    if (userId !== decodedToken.userId) {
      throw new AppError(401, "You are not authorized")
    }
  }

  const ifUserExist = await User.findById(userId);

  if (!ifUserExist) {
    throw new AppError(httpStatus.NOT_FOUND, "User Not Found")
  }

  if (decodedToken.role === Role.ADMIN && ifUserExist.role === Role.SUPER_ADMIN) {
    throw new AppError(401, "You are not authorized")
  }

  if (payload.role) {
    if (decodedToken.role === Role.USER) {
      throw new AppError(httpStatus.FORBIDDEN, "You are not authorized");
    }

  }

  if (payload.isActive || payload.isDeleted || payload.isVerified) {
    if (decodedToken.role === Role.USER) {
      throw new AppError(httpStatus.FORBIDDEN, "You are not authorized");
    }
  }

  const newUpdatedUser = await User.findByIdAndUpdate(userId, payload, { new: true, runValidators: true }).select("-password")

  return newUpdatedUser
}


// const updateMyProfile = async ({
//   userId,
//   payload,
//   decodedToken,
//   file,
//   oldPassword,
//   newPassword,
//   confirmPassword,
// }: any) => {
//   const user = await User.findById(userId);
//   if (!user) throw new AppError(404, "User not found");

//   // Authorization check
//   if (decodedToken.role === "USER" && decodedToken.userId !== userId) {
//     throw new AppError(403, "You are not authorized");
//   }

//   // Handle password change if requested
//   if (oldPassword || newPassword || confirmPassword) {
//     if (!oldPassword || !newPassword || !confirmPassword) {
//       throw new AppError(400, "All password fields are required");
//     }

//     if (newPassword !== confirmPassword) {
//       throw new AppError(400, "Passwords do not match");
//     }

//     const isOldPasswordMatch = await bcryptjs.compare(oldPassword, user.password as string);
//     if (!isOldPasswordMatch) {
//       throw new AppError(httpStatus.UNAUTHORIZED, "Old password does not match");
//     }

//     payload.password = await bcryptjs.hash(
//       newPassword,
//       Number(envVars.BCRYPT_SALT_ROUND || 10)
//     );
//   }

//   // Handle profile picture update
//   if (file) {
//     if (user.picture) {
//       const oldKey = getS3KeyFromUrl(user.picture);
//       if (oldKey) await deleteFileFromS3(oldKey);
//     }
//     payload.picture = file.location;
//   }

//   // Update user
//   const updated = await User.findByIdAndUpdate(userId, payload, {
//     returnDocument: "after",
//     runValidators: true,
//   });

//   return updated;
// };

export const getS3KeyFromUrl = (url: string) => {
  const parts = url.split(`/${envVars.S3.S3_BUCKET_NAME}/`);
  return parts[1] ?? "";
};

const updateMyProfile = async ({
  userId,
  payload,
  decodedToken,
  file
}: any) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError(404, "User not found");

  // Authorization check
  if (decodedToken.role === "USER" && decodedToken.userId !== userId) {
    throw new AppError(403, "You are not authorized");
  }

  // ===============================
  // 🔐 ONLY ALLOWED FIELDS
  // ===============================
  const allowedFields = ["name", "location", "accountType", "occupation", "businessName"];

  const filteredPayload: any = {};

  Object.keys(payload).forEach((key) => {
    if (allowedFields.includes(key)) {
      filteredPayload[key] = payload[key];
    }
  });

  // ===============================
  // 🖼️ PROFILE PICTURE UPDATE
  // ===============================
  if (file) {
    if (user.picture) {
      const oldKey = getS3KeyFromUrl(user.picture);
      if (oldKey) await deleteFileFromS3(oldKey);
    }

    filteredPayload.picture = file.location;
  }

  // ===============================
  // 🚀 UPDATE USER
  // ===============================
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    filteredPayload,
    {
      new: true,
      runValidators: true,
    }
  ).select("-password");

  return updatedUser;
};
const deleteUserById = async (id: string) => {
  const user = await User.findByIdAndDelete(id);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  return user;
};

const deleteAllUsers = async () => {
  const result = await User.deleteMany({});

  return result;
};

const deleteOwnAccount = async (userId: string) => {

  const user = await User.findById(userId);
  if (!user) throw new AppError(httpStatus.NOT_FOUND, "User not found");

  await User.findByIdAndDelete(userId);

  return { message: "Your account has been deleted successfully" };
};


export const getMyLibrary = async (userId: string) => {

  // =========================
  // 1️⃣ SUBSCRIPTION
  // =========================/n
//   const subscription = await Subscription.findOne({
//     user: userId,
//     status: "ACTIVE",
//   }).populate<{ plan: IPlan }>("plan");

//   const planAccess = subscription?.plan?.access;

  // =========================
  // 2️⃣ PURCHASED DATA
  // =========================
//   const payments = await Payment.find({
//     user: userId,
//     status: "PAID",
//   });

//   const productPurchases = payments.filter(
//     (p) => p.itemType === "PRODUCT"
//   );

//   const coursePurchases = payments.filter(
//     (p) => p.itemType === "COURSE"
//   );

//   const bundlePurchases = payments.filter(
//     (p) => p.itemType === "BUNDLE"
//   );

  // =========================
  // 3️⃣ PRODUCTS (merge subscription + purchase)
  // =========================
//   const purchasedProductIds = productPurchases.map((p) =>
//     p.itemId.toString()
//   );

//   const subscriptionProductIds =
//     planAccess?.products?.map((p: any) => p.product.toString()) || [];

//   const allProductIds = [
//     ...new Set([...purchasedProductIds, ...subscriptionProductIds]),
//   ];

//   const products = await Product.find({
//     _id: { $in: allProductIds },
//   }).populate("category");

//   const enrichedProducts = products.map((product) => {

//     // check purchase
//     const purchase = productPurchases.find(
//       (p) => p.itemId.toString() === product._id.toString()
//     );

//     // check subscription access
//     const subAccess = planAccess?.products?.find(
//       (p: any) => p.product.toString() === product._id.toString()
//     );

//     const tier =
//       purchase?.planType || subAccess?.fileAccess || "basic";

//     return {
//       ...product.toObject(),
//       files: getFilesByTier(product, tier),
//       isPurchased: true,
//       accessType: purchase ? "PURCHASE" : "SUBSCRIPTION",
//       tier,
//     };
//   });

  // =========================
  // 4️⃣ COURSES
  // ========================= /n
//   const purchasedCourseIds = coursePurchases.map((p) =>
//     p.itemId.toString()
//   );

//   const subscriptionCourseIds =
//     planAccess?.courses || [];

//   const allCourseIds = [
//     ...new Set([...purchasedCourseIds, ...subscriptionCourseIds]),
//   ];

//   const courses = await Course.find({
//     _id: { $in: allCourseIds },
//   });

  // =========================
  // 5️⃣ BUNDLES
  // =========================
//   const purchasedBundleIds = bundlePurchases.map((p) =>
//     p.itemId.toString()
//   );

//   const subscriptionBundleIds =
//     planAccess?.bundles || [];

//   const allBundleIds = [
//     ...new Set([...purchasedBundleIds, ...subscriptionBundleIds]),
//   ];

//   const bundles = await Bundle.find({
//     _id: { $in: allBundleIds },
//   });

  // =========================
  // FINAL RESPONSE
  // =========================
//   return {
//     products: enrichedProducts,
//     courses,
//     bundles,
//   };
};

export const UserServices = {
  createUser,
  getAllUsers,
  getMe,
  getSingleUser,
  updateUser,
  updateMyProfile,
  deleteUserById,
  deleteAllUsers,
  deleteOwnAccount,
  getMyLibrary
};
