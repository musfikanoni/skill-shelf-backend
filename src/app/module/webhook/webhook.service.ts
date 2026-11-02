import { stripe } from "../../config/stripe";
import { Subscription } from "../subscription/subscription.model";
import { User } from "../user/user.model";
import { SubscriptionStatus } from "../user/user.interface";
import { Order } from "../order/order.model";
import { Product } from "../product/product.model";
import { Enrollment } from "../enrollment/enrollment.model";
import { Payment } from "../payment/payment.model";
import { OrderStatus, PlanType } from "../order/order.interface";
import { Bundle } from "../bundle/bundle.model";
import AppError from "../../errorHelpers/AppError";
import httpStatus from "http-status-codes";

// =====================================
// 🔥 MAIN WEBHOOK HANDLER (UNIFIED VERSION)
// =====================================

export const handleStripeWebhook = async (event: any) => {
  const session = event.data.object;

  try {
    // =====================================
    // 🔵 SUBSCRIPTION CREATED
    // =====================================
    if (event.type === "customer.subscription.created") {
      const { userId, planId } = session.metadata || {};

      if (userId && planId) {
        const periodEnd = session.current_period_end
          ? new Date(session.current_period_end * 1000)
          : session.items?.data?.[0]?.current_period_end
          ? new Date(session.items.data[0].current_period_end * 1000)
          : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

        await Subscription.findOneAndUpdate(
          { user: userId },
          {
            user: userId,
            plan: planId,
            stripeSubscriptionId: session.id,
            stripeCustomerId:
              typeof session.customer === "string"
                ? session.customer
                : session.customer?.id,
            status:
              session.status === "trialing"
                ? SubscriptionStatus.TRIAL
                : SubscriptionStatus.ACTIVE,
            currentPeriodEnd: periodEnd,
            trialEnd: session.trial_end
              ? new Date(session.trial_end * 1000)
              : null,
          },
          { upsert: true, new: true }
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
    }

    // =====================================
    // 🔄 SUBSCRIPTION UPDATED
    // =====================================
    if (event.type === "customer.subscription.updated") {
      const periodEnd = session.current_period_end
        ? new Date(session.current_period_end * 1000)
        : session.items?.data?.[0]?.current_period_end
        ? new Date(session.items.data[0].current_period_end * 1000)
        : null;

      await Subscription.findOneAndUpdate(
        { stripeSubscriptionId: session.id },
        {
          status:
            session.status === "active"
              ? SubscriptionStatus.ACTIVE
              : session.status === "trialing"
              ? SubscriptionStatus.TRIAL
              : SubscriptionStatus.CANCELLED,
          ...(periodEnd && { currentPeriodEnd: periodEnd }),
        }
      );
    }

    // =====================================
    // 💰 INVOICE PAID
    // =====================================
    if (event.type === "invoice.paid") {
      if (session.subscription) {
        try {
          const sub: any = await stripe.subscriptions.retrieve(session.subscription);
          const periodEnd = sub.current_period_end
            ? new Date(sub.current_period_end * 1000)
            : sub.items?.data?.[0]?.current_period_end
            ? new Date(sub.items.data[0].current_period_end * 1000)
            : null;

          await Subscription.findOneAndUpdate(
            { stripeSubscriptionId: sub.id },
            {
              status: SubscriptionStatus.ACTIVE,
              ...(periodEnd && { currentPeriodEnd: periodEnd }),
            }
          );
        } catch (e) {
          console.error("Error retrieving sub on invoice.paid:", e);
        }
      }
    }

    // =====================================
    // ❌ PAYMENT FAILED
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
    // =====================================
    if (event.type === "checkout.session.completed") {
      // 1️⃣ Handle Subscription Checkout Session
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
          let currentPeriodEnd = new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000
          );
          if (subscriptionId) {
            try {
              const sub: any = await stripe.subscriptions.retrieve(subscriptionId);
              if (sub.current_period_end) {
                currentPeriodEnd = new Date(sub.current_period_end * 1000);
              } else if (sub.items?.data?.[0]?.current_period_end) {
                currentPeriodEnd = new Date(
                  sub.items.data[0].current_period_end * 1000
                );
              }
            } catch (err) {
              console.error("Error retrieving subscription from Stripe:", err);
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
        }
        return;
      }

      // 2️⃣ Handle One-time Checkout (PRODUCT, COURSE, BUNDLE)
      const payment = await Payment.findOne({
        stripeSessionId: session.id,
      });

      if (!payment || payment.status === "PAID") return;

      payment.status = "PAID";
      await payment.save();

      // Product Purchase
      if (payment.itemType === "PRODUCT") {
        const orderQty = payment.quantity || 1;
        const product = await Product.findById(payment.itemId);

        if (product) {
          await Order.create({
            user: payment.user,
            product: payment.itemId,
            status: OrderStatus.PAID,
            productQuantity: orderQty,
            finalAmount: payment.amount as number,
            planType: (payment.planType as PlanType) || PlanType.basic,
            discountAmount: 0,
            currency: "USD",
          });
        }
      }

      // Course Enrollment
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
            amount: payment.amount as number,
            stripeSessionId: payment.stripeSessionId as string,
          });
        }
      }

      // Bundle Purchase
      if (payment.itemType === "BUNDLE") {
        const bundle = await Bundle.findById(payment.itemId);

        if (bundle) {
          const courseIds = (bundle.courses || []).map((c: any) =>
            typeof c === "string" ? c : c._id
          );
          const productIds = (bundle.products || []).map((p: any) =>
            typeof p === "string" ? p : p._id
          );

          for (const id of courseIds) {
            const exists = await Enrollment.findOne({
              user: payment.user,
              course: id,
            });
            if (!exists) {
              await Enrollment.create({
                user: payment.user,
                course: id,
                status: "PAID",
                amount: payment.amount as number,
                stripeSessionId: payment.stripeSessionId as string,
              });
            }
          }

          for (const prodId of productIds) {
            const exists = await Order.findOne({
              user: payment.user,
              product: prodId,
            });
            if (!exists) {
              await Order.create({
                user: payment.user,
                product: prodId,
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
  } catch (error) {
    console.error("🔥 Webhook Error:", error);
  }
};
