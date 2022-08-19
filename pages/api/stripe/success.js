import prisma from "lib/prisma";
import nodemailer from "nodemailer";

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

  //==========
  // Init the nodemailer
  const transporter = nodemailer.createTransport(process.env.EMAIL_SERVER);

  //==========
  // The shop owner email - note that to get this to work, instead of
  // 'display_items', we need to use 'line_items.data'.
  let bodyToOwner = `
  <p>New order</p>
  <p>Total paid $${stripe_session.amount_total / 100}</p>


  <p>Customer: ${stripe_session.customer_details.name}</p>
  <p>Email: ${stripe_session.customer_details.email}</p>
  <p>Address: ${stripe_session.customer_details.address.line1} ${
    stripe_session.customer_details.address.city
  } ${stripe_session.customer_details.address.country}</p>

  <p>Products:</p>

  `;

  stripe_session.line_items.data.map((item) => {
    bodyToOwner += `<p>${item.quantity} ${item.description}</p>`;
  });

  //==========
  // Customer email, again, using 'line_items.data'.  Also, from line_items,
  // there's no customer.name - use item.description instead.
  let bodyToCustomer = `
  <p>Thanks for your order!</p>
 
  <p>Products bought:</p>

  `;

  stripe_session.line_items.data.map((item) => {
    bodyToCustomer += `<p>${item.quantity} ${item.description}</p>`;
  });

  bodyToCustomer += `<p>We'll ship those as soon as possible</p>`;

  //==========
  // Send the emails
  transporter.sendMail(
    {
      to: process.env.EMAIL_FROM,
      from: process.env.EMAIL_FROM,
      subject: "New order!",
      html: bodyToOwner,
    },
    (err, info) => {
      if (err) {
        console.log(err);
      }
    }
  );

  transporter.sendMail(
    {
      to: stripe_session.customer_details.email,
      from: process.env.EMAIL_FROM,
      subject: "Thanks for your order!",
      html: bodyToCustomer,
    },
    (err, info) => {
      if (err) {
        console.log(err);
      }
    }
  );

  //==========
  // Send results back to the client.
  res.end();
};
