import cron from "node-cron";
import { Payment } from "./payment.model";
import { stripe } from "../../config/stripe";

cron.schedule("*/5 * * * *", async () => {
  const now = new Date();

  const expired = await Payment.find({
    status: "PENDING",
    expiresAt: { $lte: now },
  });

  for (const p of expired) {
    if (!p.stripeSessionId) continue;

    const session = await stripe.checkout.sessions.retrieve(
      p.stripeSessionId
    );

    if (session.payment_status !== "paid") {
      p.status = "EXPIRED";
      await p.save();
    } else {
      p.status = "PAID";
      await p.save();
    }
  }
});