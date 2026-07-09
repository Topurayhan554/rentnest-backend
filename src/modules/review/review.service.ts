import httpStatus from "http-status";
import { prisma } from "../../lib/prisma";
import { ICreateReview } from "./review.interface";
import { AppError } from "../../utils/app.Error";

const createReviewIntoDB = async (tenantId: string, payload: ICreateReview) => {
  const completedRental = await prisma.rentalRequest.findFirst({
    where: {
      tenantId,
      propertyId: payload.propertyId,
      status: "COMPLETED",
    },
  });

  if (!completedRental) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "You can only review a property after completing a rental",
    );
  }

  const existingReview = await prisma.review.findFirst({
    where: { tenantId, propertyId: payload.propertyId },
  });
  if (existingReview) {
    throw new AppError(
      httpStatus.CONFLICT,
      "You have already reviewed this property",
    );
  }

  const review = await prisma.review.create({
    data: {
      tenantId,
      propertyId: payload.propertyId,
      rating: payload.rating,
      comment: payload.comment as string,
    },
    include: { tenant: { select: { id: true, name: true } } },
  });

  return review;
};

const getPropertyReviewsFromDB = async (propertyId: string) => {
  const reviews = await prisma.review.findMany({
    where: { propertyId },
    include: { tenant: { select: { id: true, name: true } } },
    orderBy: { createdAt: "desc" },
  });
  return reviews;
};

export const reviewService = { createReviewIntoDB, getPropertyReviewsFromDB };
