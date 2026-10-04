import { stripe } from "../../config/stripe";
import { Product } from "../product/product.model";
import { User } from "../user/user.model";
import AppError from "../../errorHelpers/AppError";
import httpStatus from "http-status-codes";
import { PlanType } from "./order.interface";
import { Payment } from "../payment/payment.model";
import { QueryBuilder } from "../../utils/QueryBuiler";
import { Coupon } from "../coupon/coupon.model";

const createProductCheckout = async (
    userId: string,
    productId: string,
    orderQuantity: number,
    planType: PlanType,
    couponCode?: string,
) => {

    const user = await User.findById(userId);
    if (!user) throw new AppError(httpStatus.NOT_FOUND, "User not found");

    const product = await Product.findById(productId);
    if (!product) throw new AppError(httpStatus.NOT_FOUND, "Product not found");
    const quantity = Number(orderQuantity);

    if (!quantity || isNaN(quantity) || quantity <= 0) {
        throw new AppError(httpStatus.BAD_REQUEST, "Invalid quantity");
    }
  

    let unitPrice = 0;

    if (planType === PlanType.basic) unitPrice = product.price.basic;
    else if (planType === PlanType.pro) unitPrice = product.price.pro;
    else if (planType === PlanType.vip) unitPrice = product.price.vip;
    else throw new AppError(httpStatus.BAD_REQUEST, "Invalid plan type");

    const baseAmount = unitPrice * quantity;

    let discountAmount = 0;
    let finalAmount = baseAmount;
    let appliedCoupon = null;

    if (couponCode) {
        const coupon = await Coupon.findOne({
            code: couponCode.toUpperCase(),
            isActive: true
        });

        if (!coupon) {
            throw new AppError(httpStatus.BAD_REQUEST, "Invalid coupon");
        }

        if (new Date() > coupon.expiresAt) {
            throw new AppError(httpStatus.BAD_REQUEST, "Coupon expired");
        }

        if (coupon.minOrderAmount && baseAmount < coupon.minOrderAmount) {
            throw new AppError(
                httpStatus.BAD_REQUEST,
                `Minimum order ${coupon.minOrderAmount} required`
            );
        }

        // discount calculate
        if (coupon.discountType === "PERCENTAGE") {
            discountAmount = (baseAmount * coupon.discountValue) / 100;

            if (coupon.maxDiscountAmount) {
                discountAmount = Math.min(discountAmount, coupon.maxDiscountAmount);
            }
        } else {
            discountAmount = coupon.discountValue;
        }

        finalAmount = baseAmount - discountAmount;
        appliedCoupon = coupon.code;
    }

    let stripeCustomerId = user.stripeCustomerId;

    if (!stripeCustomerId) {
        const customer = await stripe.customers.create({
            email: user.email,
            name: user.name,
            metadata: { userId: user._id.toString() }
        });

        stripeCustomerId = customer.id;
        user.stripeCustomerId = stripeCustomerId;
        await user.save();
    }

    const session = await stripe.checkout.sessions.create({
        mode: "payment", // 🔥 IMPORTANT
        customer: stripeCustomerId,

        line_items: [
            {
                price_data: {
                    currency: "usd",
                    product_data: {
                        name: product.name
                    },
                    unit_amount: Math.round(finalAmount * 100)

                },
                quantity: 1,
            }
        ],

        success_url: `${process.env.FRONTEND_URL}/success`,
        cancel_url: `${process.env.FRONTEND_URL}/cancel`,

        metadata: {
            userId: userId,
            productId: productId,
            quantity: String(quantity),
            planType,
            coupon: appliedCoupon || "",
            discount: String(discountAmount),
            total: String(finalAmount)
        }
    });
    console.log("ORDER QUANTITY:", orderQuantity);
    console.log("TYPE:", typeof orderQuantity);

    // create pending order
    // await Order.create({
    //     user: userId,
    //     product: productId,
    //     stripeSessionId: session.id,
    //     planType,
    //     discountAmount,
    //     finalAmount,
    //     productQuantity: quantity,
    //     couponCode: appliedCoupon,
    // });

    await Payment.create({
        user: userId,
        itemType: "PRODUCT",
        itemId: productId,
        stripeSessionId: session.id,
        planType,
        amount: finalAmount,
        status: "PENDING",
        quantity,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000),
    });
    return session.url;
};

const getAllOrders = async () => {
    const result = await Payment.find({ itemType: "PRODUCT" })
        .populate("user", "name email")
        .sort({ createdAt: -1 });

    return result;
};

const getSingleOrder = async (id: string) => {
    const result = await Payment.findById(id)
        .populate("user", "name email")

    if (!result) {
        throw new AppError(httpStatus.NOT_FOUND, "Order not found");
    }

    return result;
};

// const getMyOrders = async (userId: string) => {
//   const payments = await Payment.find({
//     user: userId,
//     itemType: "PRODUCT",
//   }).sort({ createdAt: -1 });

//   const result = await Promise.all(
//     payments.map(async (payment: any) => {
//       const product = await Product.findById(payment.itemId)
//         .populate("category");

//       if (!product) return null;

//       return {
//         _id: payment._id,

//         product: {
//           _id: product._id,
//           name: product.name,
//           images: product.images,
//         },

//         isPurchased: payment.status === "PAID",
//         purchasedPlan: payment.planType,
//         quantity: payment.quantity,
//         amount: payment.amount,
//         createdAt: payment.createdAt,
//         status: payment.status
//       };
//     })
//   );

//   return result.filter(Boolean);
// };

export const getMyOrders = async (
  userId: string,
  query: Record<string, string>
) => {
  const searchTerm = query.searchTerm || "";

  // 🔥 QueryBuilder on Payment
  const paymentQuery = new QueryBuilder(
    Payment.find({
      user: userId,
      itemType: "PRODUCT",
    }),
    query
  )
    .filter()
    .sort()
    .paginate();

  const payments = await paymentQuery.build();
  const meta = await paymentQuery.getMeta();

  // 🔥 Attach Product data
  const data = await Promise.all(
    payments.map(async (payment: any) => {
      const product = await Product.findById(payment.itemId).populate("category");

      if (!product) return null;

      // 🔍 search on product name
      if (
        searchTerm &&
        !product.name.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        return null;
      }

      return {
        _id: payment._id,

        product: {
          _id: product._id,
          name: product.name,
          images: product.images,
        },

        isPurchased: payment.status === "PAID",
        purchasedPlan: payment.planType,
        quantity: payment.quantity,
        amount: payment.amount,
        status: payment.status,
        createdAt: payment.createdAt,
      };
    })
  );

  return {
    data: data.filter(Boolean),
    meta,
  };
};

export const OrderService = {
    createProductCheckout,
    getAllOrders,
    getSingleOrder,
    getMyOrders
};