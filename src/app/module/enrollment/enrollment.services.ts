import { stripe } from "../../config/stripe";
import { Enrollment } from "./enrollment.model";
import AppError from "../../errorHelpers/AppError";
import httpStatus from "http-status-codes";
import { Course } from "../courses/courses.model";
import { Payment } from "../payment/payment.model";
import { Video } from "../video/video.model";
import { VideoProgress } from "../videoProgress/videoProgress.model";

const createCourseCheckoutSession = async (
  userId: string,
  courseId: string
) => {
  // 1️⃣ Check course exists
  const course = await Course.findById(courseId);

  if (!course || !course.isPublished) {
    throw new AppError(httpStatus.NOT_FOUND, "Course not available");
  }

  // 2️⃣ Prevent duplicate purchase
  const existingEnrollment = await Enrollment.findOne({
    user: userId,
    course: courseId,
    status: "PAID",
  });

  if (existingEnrollment) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "You already purchased this course"
    );
  }

  // 3️⃣ Create Stripe Checkout Session
  const session = await stripe.checkout.sessions.create({
    mode: "payment",

    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: course.title,
          },
          unit_amount: Math.round(course.price * 100),
        },
        quantity: 1,
      },
    ],

    success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.FRONTEND_URL}/cancel`,

    metadata: {
      userId,
      courseId,
      type: "COURSE_PURCHASE",
    },
  });

  await Payment.create({
    user: userId,
    itemType: "COURSE",
    itemId: courseId,
    stripeSessionId: session.id,
    amount: course.price,
    status: "PENDING",
    expiresAt: new Date(Date.now() + 30 * 60 * 1000),
  });

  return session.url;
};

const getAllEnrollments = async () => {
  const result = await Payment.find({ itemType: "COURSE" })
    .populate("user", "name email")
    .sort({ createdAt: -1 });

  return result;
};

const getSingleEnrollment = async (id: string) => {
  const result = await Payment.findById(id).populate("user", "name email");

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, "Enrollment not found");
  }

  return result;
};

const getMyEnrollments = async (userId: string) => {
  // 1. Fetch from Enrollment collection (direct & bundle enrollments)
  const enrollments = await Enrollment.find({
    user: userId,
    status: "PAID",
  }).sort({ createdAt: -1 });

  // 2. Fetch from Payment collection (direct course payments)
  const coursePayments = await Payment.find({
    user: userId,
    itemType: "COURSE",
    status: "PAID",
  }).sort({ createdAt: -1 });

  // 3. Deduplicate by course ID
  const courseMap = new Map();

  for (const enroll of enrollments) {
    if (enroll.course) {
      courseMap.set(enroll.course.toString(), {
        _id: enroll._id,
        courseId: enroll.course,
        amount: enroll.amount,
        createdAt: enroll.createdAt,
      });
    }
  }

  for (const pay of coursePayments) {
    if (pay.itemId && !courseMap.has(pay.itemId.toString())) {
      courseMap.set(pay.itemId.toString(), {
        _id: pay._id,
        courseId: pay.itemId,
        amount: pay.amount,
        createdAt: pay.createdAt,
      });
    }
  }

  const items = Array.from(courseMap.values());

  const result = await Promise.all(
    items.map(async (item: any) => {
      const course = await Course.findById(item.courseId);
      if (!course) return null;

      const videos = await Video.find({
        course: course._id,
        isPublished: true,
      }).lean();

      const totalVideos = videos.length;
      const totalDuration = videos.reduce(
        (sum, v) => sum + (v.duration || 0),
        0
      );

      const progress = await VideoProgress.find({
        user: userId,
        course: course._id,
      }).lean();

      const completedVideos = progress.filter((p) => p.isCompleted).length;
      const watchedDuration = progress.reduce(
        (sum, p) => sum + (p.watchedDuration || 0),
        0
      );
      const progressPercent =
        totalVideos === 0 ? 0 : Math.round((completedVideos / totalVideos) * 100);

      return {
        _id: item._id,
        course: {
          _id: course._id,
          title: course.title,
          description: course.description,
          thumbnail: course.thumbnail,
          price: course.price,
        },
        totalVideos,
        totalDuration,
        completedVideos,
        watchedDuration,
        progress: progressPercent,
        isEnrolled: true,
        amount: item.amount,
        createdAt: item.createdAt,
      };
    })
  );

  return result.filter(Boolean);
};

export const EnrollmentService = {
  createCourseCheckoutSession,
  getAllEnrollments,
  getSingleEnrollment,
  getMyEnrollments,
};
