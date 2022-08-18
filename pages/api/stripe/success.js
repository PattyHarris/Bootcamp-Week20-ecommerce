import prisma from "lib/prisma";

export default async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).end();
    return;
  }

  const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
  const stripe_session = await stripe.checkout.sessions.retrieve(
    req.body.session_id,
    { expand: ["line_items"] }
  );

  await prisma.order.create({
    data: {
      customer: stripe_session.customer_details,
      products: stripe_session.line_items,
      payment_intent: stripe_session.payment_intent,
      amount: parseInt(stripe_session.amount_total),
    },
  });

  console.log(stripe_session.customer_details);
  res.end();
};
