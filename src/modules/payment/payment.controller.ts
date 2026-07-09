import httpStatus from "http-status";
import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { paymentService } from "./payment.service";
import { stripe } from "../../lib/stripe";
import config from "../../config";
import { AppError } from "../../utils/app.Error";

const createPayment = catchAsync(async (req: Request, res: Response) => {
  const result = await paymentService.createPaymentSession(
    req.user!.id,
    req.body,
  );
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Payment session created successfully",
    data: result,
  });
});

const confirmPayment = catchAsync(async (req: Request, res: Response) => {
  const signature = req.headers["stripe-signature"] as string;
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      config.stripe_webhook_secret,
    );
  } catch (err: any) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `Webhook signature verification failed: ${err.message}`,
    );
  }

  await paymentService.confirmPaymentWebhook(event);
  res.status(httpStatus.OK).send({ received: true });
});

const getMyPayments = catchAsync(async (req: Request, res: Response) => {
  const payments = await paymentService.getMyPaymentsFromDB(req.user!.id);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Your payments fetched successfully",
    data: payments,
  });
});

const getSinglePayment = catchAsync(async (req: Request, res: Response) => {
  const payment = await paymentService.getSinglePaymentFromDB(
    req.params.id as string,
    req.user!.id,
    req.user!.role,
  );
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Payment fetched successfully",
    data: payment,
  });
});

export const paymentController = {
  createPayment,
  confirmPayment,
  getMyPayments,
  getSinglePayment,
};
