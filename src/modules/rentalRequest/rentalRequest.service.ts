import httpStatus from "http-status";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/app.Error";
import {
  ICreateRentalRequest,
  IRentalRequestQuery,
  IUpdateRentalRequestStatus,
} from "./rentalRequest.interface";

const createRentalRequestIntoDB = async (
  tenantId: string,
  payload: ICreateRentalRequest,
) => {
  const property = await prisma.property.findUnique({
    where: { id: payload.propertyId },
  });
  if (!property) {
    throw new AppError(httpStatus.NOT_FOUND, "Property not found");
  }
  if (!property.isAvailable) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "This property is not available right now",
    );
  }

  const existingRequest = await prisma.rentalRequest.findFirst({
    where: {
      tenantId,
      propertyId: payload.propertyId,
      status: { in: ["PENDING", "APPROVED", "ACTIVE"] },
    },
  });
  if (existingRequest) {
    throw new AppError(
      httpStatus.CONFLICT,
      "You already have an active request for this property",
    );
  }

  const rentalRequest = await prisma.rentalRequest.create({
    data: {
      tenantId,
      propertyId: payload.propertyId,
      moveInDate: payload.moveInDate ? new Date(payload.moveInDate) : undefined,
      message: payload.message as string,
    },
    include: { property: true },
  });

  return rentalRequest;
};

const getMyRentalRequestsFromDB = async (
  tenantId: string,
  query: IRentalRequestQuery,
) => {
  const limit = query.limit ? Number(query.limit) : 10;
  const page = query.page ? Number(query.page) : 1;
  const skip = (page - 1) * limit;

  const where = {
    tenantId,
    ...(query.status && { status: query.status }),
  };

  const requests = await prisma.rentalRequest.findMany({
    where,
    take: limit,
    skip,
    orderBy: { createdAt: "desc" },
    include: { property: true, payment: true },
  });

  const total = await prisma.rentalRequest.count({ where });

  return {
    data: requests,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

const getLandlordRentalRequestsFromDB = async (
  landlordId: string,
  query: IRentalRequestQuery,
) => {
  const limit = query.limit ? Number(query.limit) : 10;
  const page = query.page ? Number(query.page) : 1;
  const skip = (page - 1) * limit;

  const where = {
    property: { landlordId },
    ...(query.status && { status: query.status }),
  };

  const requests = await prisma.rentalRequest.findMany({
    where,
    take: limit,
    skip,
    orderBy: { createdAt: "desc" },
    include: {
      property: true,
      tenant: { select: { id: true, name: true, email: true } },
      payment: true,
    },
  });

  const total = await prisma.rentalRequest.count({ where });

  return {
    data: requests,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

const getSingleRentalRequestFromDB = async (
  id: string,
  userId: string,
  role: string,
) => {
  const request = await prisma.rentalRequest.findUnique({
    where: { id },
    include: {
      property: true,
      tenant: { select: { id: true, name: true, email: true } },
      payment: true,
    },
  });
  if (!request) {
    throw new AppError(httpStatus.NOT_FOUND, "Rental request not found");
  }

  const isTenantOwner = request.tenantId === userId;
  const isLandlordOwner = request.property.landlordId === userId;

  if (role !== "ADMIN" && !isTenantOwner && !isLandlordOwner) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You don't have access to this request",
    );
  }

  return request;
};

const updateRentalRequestStatusInDB = async (
  id: string,
  landlordId: string,
  payload: IUpdateRentalRequestStatus,
) => {
  const request = await prisma.rentalRequest.findUnique({
    where: { id },
    include: { property: true },
  });
  if (!request) {
    throw new AppError(httpStatus.NOT_FOUND, "Rental request not found");
  }
  if (request.property.landlordId !== landlordId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not the owner of this property",
    );
  }

  // Valid status transitions
  const validTransitions: Record<string, string[]> = {
    PENDING: ["APPROVED", "REJECTED"],
    APPROVED: ["ACTIVE"],
    ACTIVE: ["COMPLETED"],
  };

  const allowedNext = validTransitions[request.status] || [];
  if (!allowedNext.includes(payload.status)) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `Cannot change status from ${request.status} to ${payload.status}`,
    );
  }

  const updated = await prisma.rentalRequest.update({
    where: { id },
    data: { status: payload.status },
    include: {
      property: true,
      tenant: { select: { id: true, name: true, email: true } },
    },
  });

  // If approved, mark property unavailable
  if (payload.status === "APPROVED") {
    await prisma.property.update({
      where: { id: request.propertyId },
      data: { isAvailable: false },
    });
  }

  return updated;
};

export const rentalRequestService = {
  createRentalRequestIntoDB,
  getMyRentalRequestsFromDB,
  getLandlordRentalRequestsFromDB,
  getSingleRentalRequestFromDB,
  updateRentalRequestStatusInDB,
};
