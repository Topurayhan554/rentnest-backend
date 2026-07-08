import { NextFunction, Request, Response } from "express";
import HttpStatus from "http-status";
export const notFound = (req: Request, res: Response, next: NextFunction) => {
  res.status(HttpStatus.NOT_FOUND).json({
    success: false,
    message: "API not found",
    errorDetails: {
      path: req.originalUrl,
      method: req.method,
    },
  });
};
