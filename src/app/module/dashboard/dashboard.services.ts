import { Bundle } from "../bundle/bundle.model";
import { Enrollment } from "../enrollment/enrollment.model";
import { Order } from "../order/order.model";
import { Payment } from "../payment/payment.model";
import { Product } from "../product/product.model";
import { Subscription } from "../subscription/subscription.model";
import { User } from "../user/user.model";
import { SubscriptionStatus } from "../user/user.interface";
import { OrderStatus } from "../order/order.interface";


const getDashboardOverview = async () => {

  const revenueResult = await Payment.aggregate([
    { $match: { status: "PAID" } },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: "$amount" },
      },
    },
  ]);

  const totalRevenue = revenueResult[0]?.totalRevenue || 0;

 
  const totalProductOrders = await Order.countDocuments({
    status: OrderStatus.PAID,
  });
  const totalEnrollments = await Enrollment.countDocuments({
    status: "PAID",
  });
  const totalBundles = await Bundle.countDocuments({
    status: "PAID",
  });

  const totalOrders = totalProductOrders + totalEnrollments + totalBundles


  const activeSubscriptions = await Subscription.countDocuments({
    status: SubscriptionStatus.ACTIVE,
  });

  const totalProducts = await Product.countDocuments();

  const totalUsers = await User.countDocuments();

  return {
    totalRevenue,
    totalOrders,
    activeSubscriptions,
    totalProducts,
    totalUsers,
  };
};


const getUserDashboard = async (userId: string) => {
  const [
    totalOrders,
    totalPurchasedCourses,
    activeSubscription,
    lastThreeOrders
  ] = await Promise.all([
    // Payment.countDocuments({ user: userId }),

    Payment.countDocuments({
      user: userId,
      itemType: "PRODUCT",
      // status: "PAID"
    }),
    Payment.countDocuments({
      user: userId,
      itemType: "COURSE",
      status: "PAID"
    }),

    Subscription.findOne({
      user: userId,
      status: SubscriptionStatus.ACTIVE,
    }).populate("plan"),

    Payment.find({ user: userId, itemType: "PRODUCT" })
      .sort({ createdAt: -1 })
      .limit(3)
  ]);

  return {
    totalOrders,
    totalPurchasedCourses,
    activePlan: activeSubscription
      ? {
          name: (activeSubscription.plan as any)?.name,
          expireAt: activeSubscription.currentPeriodEnd
        }
      : null,
    lastThreeOrders
  };
};
export const DashboardServices = {
  getDashboardOverview,
  getUserDashboard
}
