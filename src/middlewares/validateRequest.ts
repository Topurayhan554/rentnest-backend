import { NextFunction, Request, Response } from "express";
import { ZodTypeAny } from "zod";
import { catchAsync } from "../utils/catchAsync";

export const validateRequest = (schema: ZodTypeAny) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const parsed = (await schema.parseAsync({
      body: req.body,
      query: req.query,
      params: req.params,
    })) as any;

    req.body = parsed.body;

    next();
  });
};
