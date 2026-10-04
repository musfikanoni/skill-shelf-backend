
import { stripe } from "../../config/stripe";
import { Subscription } from "../subscription/subscription.model";
import { User } from "../user/user.model";
import { SubscriptionStatus } from "../user/user.interface";
import { Order } from "../order/order.model";
import { Product } from "../product/product.model";
import { Enrollment } from "../enrollment/enrollment.model";
import { Payment } from "../payment/payment.model";
import mongoose from "mongoose";
import { OrderStatus } from "../order/order.interface";
import { Bundle } from "../bundle/bundle.model";
import AppError from "../../errorHelpers/AppError";
import httpStatus from "http-status-codes";

// =====================================
// 🔥 MAIN WEBHOOK HANDLER (UNIFIED VERSION)
// WHY: single entry point for all Stripe events
// =====================================

export const handleStripeWebhook = async (event: any) => {
  const session = event.data.object;

  try {

    // =====================================
    // 🔵 SUBSCRIPTION CREATED
    // WHY: user + plan mapping init
    // =====================================
    if (event.type === "customer.subscription.created") {
      const { userId, planId } = session.metadata || {};

      if (!userId || !planId) return;

      await Subscription.findOneAndUpdate(
        { stripeSubscriptionId: session.id },
        {
          user: userId,
          plan: planId,
          stripeSubscriptionId: session.id,
          stripeCustomerId:
            typeof session.customer === "string"
              ? session.customer
              : session.customer.id,

          status:
            session.status === "trialing"
              ? SubscriptionStatus.TRIAL
              : SubscriptionStatus.ACTIVE,

          currentPeriodEnd: session.items.data[0].current_period_end
            ? new Date(session.items.data[0].current_period_end * 1000)
            : null,

          trialEnd: session.trial_end
            ? new Date(session.trial_end * 1000)
            : null,
        },
        { upsert: true }
      );

      await User.findByIdAndUpdate(userId, {
        stripeSubscriptionId: session.id,
        subscriptionStatus:
          session.status === "trialing"
            ? SubscriptionStatus.TRIAL
            : SubscriptionStatus.ACTIVE,
        currentPlan: planId,
      });
    }

    // =====================================
    // 🔄 SUBSCRIPTION UPDATED
    // WHY: status sync from Stripe
    // =====================================
    if (event.type === "customer.subscription.updated") {
      await Subscription.findOneAndUpdate(
        { stripeSubscriptionId: session.id },
        {
          status:
            session.status === "active"
              ? SubscriptionStatus.ACTIVE
              : session.status === "trialing"
                ? SubscriptionStatus.TRIAL
                : SubscriptionStatus.CANCELLED,

          currentPeriodEnd: session.items.data[0].current_period_end
            ? new Date(session.items.data[0].current_period_end * 1000)
            : null,
        }
      );
    }

    // =====================================
    // 💰 INVOICE PAID (RENEWAL / FIRST PAYMENT)
    // WHY: subscription activate guarantee
    // =====================================
    if (event.type === "invoice.paid") {
      if (!session.subscription) return;

      const sub = await stripe.subscriptions.retrieve(session.subscription);

      await Subscription.findOneAndUpdate(
        { stripeSubscriptionId: sub.id },
        {
          status: SubscriptionStatus.ACTIVE,
          currentPeriodEnd: sub.items.data[0].current_period_end
            ? new Date(sub.items.data[0].current_period_end * 1000)
            : null,
        }
      );
    }

    // =====================================
    // ❌ PAYMENT FAILED
    // WHY: downgrade / restrict access
    // =====================================
    if (event.type === "invoice.payment_failed") {
      const subscription = await Subscription.findOne({
        stripeCustomerId: session.customer,
      });

      if (subscription) {
        subscription.status = SubscriptionStatus.PAST_DUE;
        await subscription.save();
      }
    }

    // =====================================
    // ❌ SUBSCRIPTION CANCELLED
    // WHY: cleanup user state
    // =====================================
    if (event.type === "customer.subscription.deleted") {
      await Subscription.findOneAndUpdate(
        { stripeSubscriptionId: session.id },
        { status: SubscriptionStatus.CANCELLED }
      );

      await User.findOneAndUpdate(
        { stripeSubscriptionId: session.id },
        {
          subscriptionStatus: SubscriptionStatus.CANCELLED,
          currentPlan: null,
        }
      );
    }

    // =====================================
    // 💥 PAYMENT SUCCESS (MAIN CORE LOGIC)
    // WHY: product + course + subscription payment entry point
    // =====================================
    if (event.type === "checkout.session.completed") {

      const payment = await Payment.findOne({
        stripeSessionId: session.id,
      });

      // ❌ prevent duplicate execution
      if (!payment || payment.status === "PAID") return;

      payment.status = "PAID";
      await payment.save();

      const sessionDb = await mongoose.startSession();
      sessionDb.startTransaction();

      try {

        // =====================================
        // 🛒 PRODUCT PURCHASE
        // =====================================
        if (payment.itemType === "PRODUCT") {
          console.log("PAYMENT:", payment);
          console.log("ORDER QTY:", payment.quantity);
          console.log("ITEM TYPE:", payment.itemType);
          const orderQty = payment.quantity || 1;
          const product = await Product.findById(payment.itemId);

          if (!product) throw new Error("Product not found");

          await Order.create(
            [
              {
                user: payment.user,
                product: payment.itemId,
                status: OrderStatus.PAID,
                productQuantity: orderQty,
                finalAmount: payment.amount,
                planType: payment.planType,
              },
            ],
            { session: sessionDb }
          );
        }

        // =====================================
        // 🎓 COURSE ENROLLMENT
        // =====================================
        if (payment.itemType === "COURSE") {
          await Enrollment.create(
            [
              {
                user: payment.user,
                course: payment.itemId,
                status: "PAID",
                amount: payment.amount,
              },
            ],
            { session: sessionDb }
          );
        }

        if (payment.itemType === "BUNDLE") {
          console.log("🔥 BUNDLE PURCHASE START");
          const bundle = await Bundle.findById(payment.itemId);

          console.log("BUNDLE PRODUCTS:", bundle.products);
          if (!bundle) throw new AppError(httpStatus.NOT_FOUND, "Bundle not found");

          // ✅ extract IDs safely
          const productIds = bundle.products.map((p: any) =>
            typeof p === "string" ? p : p._id
          );

          const courseIds = bundle.courses.map((c: any) =>
            typeof c === "string" ? c : c._id
          );


          for (const id of courseIds) {
            await Enrollment.create(
              [
                {
                  user: payment.user,
                  course: id,
                  status: "PAID",

                  amount: payment.amount,
                  stripeSessionId: payment.stripeSessionId,
                },
              ],
              { session: sessionDb }
            );
          }
          console.log("ENROLL DATA:", {
            amount: payment.amount,
            stripeSessionId: payment.stripeSessionId,
          });
          console.log("🔥 BUNDLE COMPLETED");
        }
        // =====================================
        // 💳 SUBSCRIPTION ACTIVATION
        // =====================================
        if (payment.itemType === "SUBSCRIPTION") {
          await Subscription.findOneAndUpdate(
            { user: payment.user },
            { status: SubscriptionStatus.ACTIVE },
            { upsert: true, session: sessionDb }
          );
        }

        await sessionDb.commitTransaction();
        sessionDb.endSession();

      } catch (err) {
        await sessionDb.abortTransaction();
        sessionDb.endSession();
        throw err;
      }
    }

  } catch (error) {
    console.error("🔥 Webhook Error:", error);
  }
};