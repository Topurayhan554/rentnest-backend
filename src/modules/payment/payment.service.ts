import httpStatus from "http-status";
import Stripe from "stripe";
import { prisma } from "../../lib/prisma";
import { stripe } from "../../lib/stripe";
import config from "../../config";
import { ICreatePayment } from "./payment.interface";
import {
  handleCheckoutCompleted,
  handleCheckoutExpired,
} from "./payment.utils";
import { AppError } from "../../utils/app.Error";

const createPaymentSession = async (
  tenantId: string,
  payload: ICreatePayment,
) => {
  const rentalRequest = await prisma.rentalRequest.findUnique({
    where: { id: payload.rentalRequestId },
    include: { property: true, payment: true },
  });

  if (!rentalRequest) {
    throw new AppError(httpStatus.NOT_FOUND, "Rental request not found");
  }
  if (rentalRequest.tenantId !== tenantId) {
    throw new AppError(httpStatus.FORBIDDEN, "This is not your rental request");
  }
  if (rentalRequest.status !== "APPROVED") {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Rental request must be approved before payment",
    );
  }
  if (rentalRequest.payment) {
    throw new AppError(
      httpStatus.CONFLICT,
      "Payment already exists for this rental request",
    );
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: rentalRequest.property.title,
            description: `Rent payment for ${rentalRequest.property.location}`,
          },
          unit_amount: Math.round(rentalRequest.property.price * 100),
        },
        quantity: 1,
      },
    ],
    success_url: `${config.app_url}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${config.app_url}/payment/cancel`,
    metadata: {
      rentalRequestId: rentalRequest.id,
      tenantId,
    },
  });

  await prisma.payment.create({
    data: {
      transactionId: session.id,
      amount: rentalRequest.property.price,
      method: "card",
      provider: "STRIPE",
      status: "PENDING",
      rentalRequestId: rentalRequest.id,
    },
  });

  return { paymentUrl: session.url };
};

const handleWebhook = async (payload: Buffer, signature: string) => {
  const endpointSecret = config.stripe_webhook_secret;

  const event = stripe.webhooks.constructEvent(
    payload,
    signature,
    endpointSecret,
  );

  switch (event.type) {
    case "checkout.session.completed":
      await handleCheckoutCompleted(
        event.data.object as Stripe.Checkout.Session,
      );
      break;
    case "checkout.session.expired":
      await handleCheckoutExpired(event.data.object as Stripe.Checkout.Session);
      break;
    default:
      console.log(`Unhandled event type ${event.type}.`);
      break;
  }
};

const getMyPaymentsFromDB = async (tenantId: string) => {
  const payments = await prisma.payment.findMany({
    where: { rentalRequest: { tenantId } },
    include: { rentalRequest: { include: { property: true } } },
    orderBy: { createdAt: "desc" },
  });
  return payments;
};

const getSinglePaymentFromDB = async (
  id: string,
  tenantId: string,
  role: string,
) => {
  const payment = await prisma.payment.findUnique({
    where: { id },
    include: { rentalRequest: { include: { property: true, tenant: true } } },
  });
  if (!payment) {
    throw new AppError(httpStatus.NOT_FOUND, "Payment not found");
  }
  if (role !== "ADMIN" && payment.rentalRequest.tenantId !== tenantId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You don't have access to this payment",
    );
  }
  return payment;
};

export const paymentService = {
  createPaymentSession,
  handleWebhook,
  getMyPaymentsFromDB,
  getSinglePaymentFromDB,
};
