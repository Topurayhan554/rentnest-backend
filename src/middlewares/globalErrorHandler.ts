import httpStatus from "http-status";
import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/app.Error";
import { Prisma } from "../../generated/prisma/client";

export const globalErrorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let statusCode: number = httpStatus.INTERNAL_SERVER_ERROR;
  let message = "Something went Wrong";
  let errorDetails: unknown = error;

  if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
    errorDetails = error.errorDetails ?? error.message;
  } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      statusCode = httpStatus.CONFLICT;
      message = "Duplicate entry found";
      errorDetails = error.meta;
    } else if (error.code === "P2025") {
      statusCode = httpStatus.NOT_FOUND;
      message: "Record Not Found";
      errorDetails = error.meta;
    } else {
      statusCode = httpStatus.BAD_REQUEST;
      message = "Database request error";
      errorDetails = error.meta;
    }
  } else if (error instanceof Error) {
    message = error.message;
    errorDetails = error.message;
  }

  res.status(statusCode).json({
    success: false,
    message,
    errorDetails,
  });
};
