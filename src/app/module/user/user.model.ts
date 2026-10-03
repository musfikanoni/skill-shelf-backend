import { model, Schema } from "mongoose";
import { AccountType, IAuthProvider, IsActive, IUser, Occupation, Role, SubscriptionStatus } from "./user.interface";


const authProviderSchema = new Schema<IAuthProvider>({
    provider: { type: String, required: true },
    providerId: { type: String, required: true }
}, {
    versionKey: false,
    _id: false
})

const userSchema = new Schema<IUser>({
    name: { type: String, required: true },
    // businessName: { type: String, default: null },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    role: {
        type: String,
        enum: Object.values(Role),
        default: Role.USER
    },
    location: { type: String },
    picture: { type: String },
    isDeleted: { type: Boolean, default: false },

    isActive: {
        type: String,
        enum: Object.values(IsActive),
        default: IsActive.ACTIVE,
    },

    isVerified: { type: Boolean, default: false },

    stripeCustomerId: {
        type: String,
        default: null,
    },

    // stripeSubscriptionId: {
    //     type: String,
    //     default: null,
    // },

    // subscriptionStatus: {
    //     type: String,
    //     enum: Object.values(SubscriptionStatus),
    //     default: SubscriptionStatus.TRIAL,
    // },

    // trialEndsAt: {
    //     type: Date,
    //     default: null,
    // },

    // currentPlan: {
    //     type: Schema.Types.ObjectId,
    //     ref: "Plan",
    //     default: null,
    // },
    // currentPeriodEnd: { type: Date },
    affiliateCode: {
        type: String,
        unique: true,
        sparse: true,
    },

    referredBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        default: null,
    },

    totalCommission: {
        type: Number,
        default: 0,
    },
    auths: [authProviderSchema],
}, {
    timestamps: true,
    versionKey: false
})

export const User = model<IUser>("User", userSchema)