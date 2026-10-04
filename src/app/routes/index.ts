import { Router } from "express"

import { UserRoutes } from "../module/user/user.routes"
import { AuthRoutes } from "../module/auth/auth.routes"
import { OtpRoutes } from "../module/otp/otp.routes"
import { PlanRoutes } from "../module/plan/plan.routes"
import { SubscriptionRoutes } from "../module/subscription/subscription.routes"
import { CostRoutes } from "../module/cost/cost.routes"
import { CategoryRoutes } from "../module/category/category.routes"
import { ProductRoutes } from "../module/product/product.route"
import { ReviewRoutes } from "../module/review/review.routes"
import { CouponRoutes } from "../module/coupon/coupon.routes"
import { EnrollmentRoutes } from "../module/enrollment/enrollment.routes"
import { MilestoneRoutes } from "../module/milestone/milestone.routes"
import { VideoRoutes } from "../module/video/video.routes"
import { VideoProgressRoutes } from "../module/videoProgress/videoProgress.routes"
import { BundleRoutes } from "../module/bundle/bundle..routes"
import { AffiliateRoutes } from "../module/affiliate/affiliate.routes"
import { OrderRoutes } from "../module/order/order.routes"
import { CourseRoutes } from "../module/courses/courses.routes"

export const router = Router()

const moduleRoutes = [
    {
        path: "/auth",
        route: AuthRoutes
    },
    {
        path: "/otp",
        route: OtpRoutes
    },
    {
        path: "/user",
        route: UserRoutes
    },
    {
        path: "/plan",
        route: PlanRoutes
    },
    {
        path: "/subscription",
        route: SubscriptionRoutes
    },
    {
        path: "/cost",
        route: CostRoutes
    },
    {
        path: "/category",
        route: CategoryRoutes
    },
    {
        path: "/product",
        route: ProductRoutes
    },
    {
        path: "/review",
        route: ReviewRoutes
    },
    {
        path: "/order",
        route: OrderRoutes
    },
    {
        path: "/coupon",
        route: CouponRoutes
    },
    {
        path: "/course",
        route: CourseRoutes
    },
    {
        path: "/enrollment",
        route: EnrollmentRoutes
    },
    {
        path: "/milestone",
        route: MilestoneRoutes
    },
    {
        path: "/video",
        route: VideoRoutes
    },
    {
        path: "/video-progress",
        route: VideoProgressRoutes
    },
    {
        path: "/bundle",
        route: BundleRoutes
    },
    // {
    //     path: "/dashboard",
    //     route: DashboardRoutes
    // },
    {
        path: "/affiliate",
        route: AffiliateRoutes
    },
]

moduleRoutes.forEach((route) => {
    router.use(route.path, route.route)
})

