import httpStatus from "http-status";
import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { paymentService } from "./payment.service";

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
  await paymentService.handleWebhook(req.body, signature);
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
