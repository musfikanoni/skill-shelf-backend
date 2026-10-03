import { Router } from "express"
// import { AuthRoutes } from "../modules/auth/auth.routes"
// import { OtpRoutes } from "../modules/otp/otp.routes"
// import { PlanRoutes } from "../modules/plan/plan.routes"
// import { SubscriptionRoutes } from "../modules/subscription/subscription.routes"
// import { CostRoutes } from "../modules/cost/cost.routes"
// import { CategoryRoutes } from "../modules/category/category.routes"
// import { ProductRoutes } from "../modules/product/product.route"
// import { ReviewRoutes } from "../modules/review/review.routes"
// import { OrderRoutes } from "../modules/order/order.routes"
// import { CouponRoutes } from "../modules/coupon/coupon.routes"
// import { CourseRoutes } from "../modules/courses/courses.routes"
// import { EnrollmentRoutes } from "../modules/enrollment/enrollment.routes"
// import { MilestoneRoutes } from "../modules/milestone/milestone.routes"
// import { VideoRoutes } from "../modules/video/video.routes"
// import { VideoProgressRoutes } from "../modules/videoProgress/videoProgress.routes"
// import { BundleRoutes } from "../modules/bundle/bundle..routes"
// import { DashboardRoutes } from "../modules/dashboard/dashboard.routes"
// import { AffiliateRoutes } from "../modules/affiliate/affiliate.routes"
import { UserRoutes } from "../module/user/user.routes"

export const router = Router()

const moduleRoutes = [
    // {
    //     path: "/auth",
    //     route: AuthRoutes
    // },
    // {
    //     path: "/otp",
    //     route: OtpRoutes
    // },
    {
        path: "/user",
        route: UserRoutes
    },
    // {
    //     path: "/plan",
    //     route: PlanRoutes
    // },
    // {
    //     path: "/subscription",
    //     route: SubscriptionRoutes
    // },
    // {
    //     path: "/cost",
    //     route: CostRoutes
    // },
    // {
    //     path: "/category",
    //     route: CategoryRoutes
    // },
    // {
    //     path: "/product",
    //     route: ProductRoutes
    // },
    // {
    //     path: "/review",
    //     route: ReviewRoutes
    // },
    // {
    //     path: "/order",
    //     route: OrderRoutes
    // },
    // {
    //     path: "/coupon",
    //     route: CouponRoutes
    // },
    // {
    //     path: "/course",
    //     route: CourseRoutes
    // },
    // {
    //     path: "/enrollment",
    //     route: EnrollmentRoutes
    // },
    // {
    //     path: "/milestone",
    //     route: MilestoneRoutes
    // },
    // {
    //     path: "/video",
    //     route: VideoRoutes
    // },
    // {
    //     path: "/video-progress",
    //     route: VideoProgressRoutes
    // },
    // {
    //     path: "/bundle",
    //     route: BundleRoutes
    // },
    // {
    //     path: "/dashboard",
    //     route: DashboardRoutes
    // },
    // {
    //     path: "/affiliate",
    //     route: AffiliateRoutes
    // },
]

moduleRoutes.forEach((route) => {
    router.use(route.path, route.route)
})

