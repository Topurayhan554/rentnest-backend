import Stripe from "stripe";
import { prisma } from "../../lib/prisma";

export const handleCheckoutCompleted = async (
  session: Stripe.Checkout.Session,
) => {
  const rentalRequestId = session.metadata?.rentalRequestId;
  if (!rentalRequestId) return;

  await prisma.$transaction([
    prisma.payment.update({
      where: { transactionId: session.id },
      data: { status: "COMPLETED", paidAt: new Date() },
    }),
    prisma.rentalRequest.update({
      where: { id: rentalRequestId },
      data: { status: "ACTIVE" },
    }),
  ]);
};

export const handleCheckoutExpired = async (
  session: Stripe.Checkout.Session,
) => {
  await prisma.payment.update({
    where: { transactionId: session.id },
    data: { status: "FAILED" },
  });
};
