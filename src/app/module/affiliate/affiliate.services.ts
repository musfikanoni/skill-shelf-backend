import httpStatus from "http-status-codes";
import AppError from "../../errorHelpers/AppError";
import { Affiliate } from "./affiliate.model";
import { CommissionStatus } from "./affiliate.interface";
import { User } from "../user/user.model";

const createAffiliate = async (
  userId: string,
  payload: { referredUser: string; amount: number }
) => {
  const { referredUser, amount } = payload;

  // 1️⃣ Find referred user by email
  const referredUserData = await User.findOne({ email: referredUser });

  if (!referredUserData) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Referred user not found"
    );
  }

  // 2️⃣ Prevent self referral
  if (referredUserData._id.toString() === userId) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "You cannot refer yourself"
    );
  }

  // 3️⃣ Prevent duplicate referral
  const existing = await Affiliate.findOne({
    user: userId,
    referredUser: referredUserData._id,
  });

  if (existing) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Already referred this user"
    );
  }

  // 4️⃣ Create affiliate record
  const affiliate = await Affiliate.create({
    user: userId,
    referredUser: referredUserData._id,
    amount,
    status: CommissionStatus.PENDING,
  });

  return affiliate;
};

const getAllAffiliates = async (query: any) => {
  const { status, page = 1, limit = 10 } = query;

  const filter: any = {};

  if (status) {
    filter.status = status;
  }

  const skip = (Number(page) - 1) * Number(limit);

  const affiliates = await Affiliate.find(filter)
    .populate("user", "name email totalCommission")
    .populate("referredUser", "name email")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  const total = await Affiliate.countDocuments(filter);

  return {
    meta: {
      page: Number(page),
      limit: Number(limit),
      total,
    },
    data: affiliates,
  };
};

const getMyCommissions = async (userId: string) => {
  return await Affiliate.find({ user: userId })
    .populate("referredUser", "name email")
    .sort({ createdAt: -1 });
};

const updateCommissionStatus = async (
  id: string,
  status: CommissionStatus
) => {
  const affiliate = await Affiliate.findById(id);

  if (!affiliate)
    throw new AppError(httpStatus.NOT_FOUND, "Commission not found");

   if (affiliate.status !== CommissionStatus.PENDING) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Status already finalized"
    );
  }
  affiliate.status = status;

  // 🔥 if approved add to totalCommission
  if (status === CommissionStatus.APPROVED) {
    await User.findByIdAndUpdate(affiliate.user, {
      $inc: { totalCommission: affiliate.amount },
    });
  }

  await affiliate.save();

  return affiliate;
};

const deleteAffiliate = async (id: string) => {
  return await Affiliate.findByIdAndDelete(id);
};

export const AffiliateService = {
  createAffiliate,
  getAllAffiliates,
  getMyCommissions,
  updateCommissionStatus,
  deleteAffiliate,
};