import { stripe } from "../../config/stripe";
import { Payment } from "./payment.model";
import { Order } from "../order/order.model";
import { Product } from "../product/product.model";
import { Enrollment } from "../enrollment/enrollment.model";
import { Bundle } from "../bundle/bundle.model";
import { Subscription } from "../subscription/subscription.model";
import { User } from "../user/user.model";
import { OrderStatus, PlanType } from "../order/order.interface";
import { SubscriptionStatus } from "../user/user.interface";
import AppError from "../../errorHelpers/AppError";
import httpStatus from "http-status-codes";

export const verifyCheckoutSession = async (sessionId: string) => {
  if (!sessionId) {
    throw new AppError(httpStatus.BAD_REQUEST, "Session ID is required");
  }

  // 1. Retrieve session from Stripe
  const session = await stripe.checkout.sessions.retrieve(sessionId);

  if (!session) {
    throw new AppError(httpStatus.NOT_FOUND, "Stripe session not found");
  }

  const isPaid =
    session.payment_status === "paid" || session.status === "complete";
  if (!isPaid) {
    return {
      success: false,
      isPaid: false,
      message: "Payment is not completed yet",
    };
  }

  // 2. Handle Subscription
  if (session.mode === "subscription") {
    const userId =
      session.metadata?.userId ||
      (session as any).subscription_data?.metadata?.userId;
    const planId =
      session.metadata?.planId ||
      (session as any).subscription_data?.metadata?.planId;
    const subscriptionId =
      typeof session.subscription === "string"
        ? session.subscription
        : (session.subscription as any)?.id;
    const customerId =
      typeof session.customer === "string"
        ? session.customer
        : (session.customer as any)?.id;

    if (userId && planId) {
      let currentPeriodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      if (subscriptionId) {
        try {
          const sub = await stripe.subscriptions.retrieve(subscriptionId);
          if (sub.items?.data?.[0]?.current_period_end) {
            currentPeriodEnd = new Date(
              sub.items.data[0].current_period_end * 1000
            );
          }
        } catch (e) {
          console.error("Sub retrieve error:", e);
        }
      }

      await Subscription.findOneAndUpdate(
        { user: userId },
        {
          user: userId,
          plan: planId,
          stripeSubscriptionId: subscriptionId,
          stripeCustomerId: customerId,
          status: SubscriptionStatus.ACTIVE,
          currentPeriodEnd,
        },
        { upsert: true, new: true }
      );

      await User.findByIdAndUpdate(userId, {
        stripeSubscriptionId: subscriptionId,
        subscriptionStatus: SubscriptionStatus.ACTIVE,
        currentPlan: planId,
      });

      return {
        success: true,
        isPaid: true,
        type: "SUBSCRIPTION",
        message: "Subscription activated successfully",
      };
    }
  }

  // 3. Handle Product / Course / Bundle
  const payment = await Payment.findOne({ stripeSessionId: sessionId });

  if (payment) {
    if (payment.status !== "PAID") {
      payment.status = "PAID";
      await payment.save();

      // Product
      if (payment.itemType === "PRODUCT") {
        const existingOrder = await Order.findOne({
          user: payment.user,
          product: payment.itemId,
        });
        if (!existingOrder) {
          await Order.create({
            user: payment.user,
            product: payment.itemId,
            status: OrderStatus.PAID,
            productQuantity: payment.quantity || 1,
            finalAmount: payment.amount || 0,
            planType: payment.planType || PlanType.basic,
            discountAmount: 0,
            currency: "USD",
          });
        }
      }

      // Course
      if (payment.itemType === "COURSE") {
        const existingEnroll = await Enrollment.findOne({
          user: payment.user,
          course: payment.itemId,
        });
        if (!existingEnroll) {
          await Enrollment.create({
            user: payment.user,
            course: payment.itemId,
            status: "PAID",
            amount: payment.amount || 0,
            stripeSessionId: sessionId,
          });
        }
      }

      // Bundle
      if (payment.itemType === "BUNDLE") {
        const bundle = await Bundle.findById(payment.itemId);
        if (bundle) {
          const courseIds = (bundle.courses || []).map((c: any) =>
            typeof c === "string" ? c : c._id
          );
          const productIds = (bundle.products || []).map((p: any) =>
            typeof p === "string" ? p : p._id
          );

          for (const cId of courseIds) {
            const exists = await Enrollment.findOne({
              user: payment.user,
              course: cId,
            });
            if (!exists) {
              await Enrollment.create({
                user: payment.user,
                course: cId,
                status: "PAID",
                amount: payment.amount || 0,
                stripeSessionId: sessionId,
              });
            }
          }

          for (const pId of productIds) {
            const exists = await Order.findOne({
              user: payment.user,
              product: pId,
            });
            if (!exists) {
              await Order.create({
                user: payment.user,
                product: pId,
                status: OrderStatus.PAID,
                productQuantity: 1,
                finalAmount: 0,
                planType: PlanType.vip,
                discountAmount: 0,
                currency: "USD",
              });
            }
          }
        }
      }
    }

    return {
      success: true,
      isPaid: true,
      type: payment.itemType,
      message: `${payment.itemType} payment confirmed`,
    };
  }

  return {
    success: true,
    isPaid: true,
    message: "Payment verified",
  };
};

export const PaymentService = {
  verifyCheckoutSession,
};

