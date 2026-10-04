export const checkSubscription = async (req: any, res: any, next: any) => {
  const user = req.user;

  if (user.subscriptionStatus === "TRIAL") {
    if (new Date() > user.trialEndsAt) {
      user.subscriptionStatus = "EXPIRED";
      await user.save();

      return res.status(403).json({
        message: "Trial expired. Please subscribe.",
      });
    }
  }

  if (user.subscriptionStatus !== "ACTIVE") {
    return res.status(403).json({
      message: "Subscription required",
    });
  }

  next();
};