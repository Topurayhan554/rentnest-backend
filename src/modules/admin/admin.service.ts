import httpStatus from "http-status";
import { prisma } from "../../lib/prisma";
import { IAdminQuery, IUpdateUserStatus } from "./admin.interface";
import { AppError } from "../../utils/app.Error";

const getAllUsersFromDB = async (query: IAdminQuery) => {
  const limit = query.limit ? Number(query.limit) : 10;
  const page = query.page ? Number(query.page) : 1;
  const skip = (page - 1) * limit;

  const where = query.searchTerm
    ? {
        OR: [
          {
            name: { contains: query.searchTerm, mode: "insensitive" as const },
          },
          {
            email: { contains: query.searchTerm, mode: "insensitive" as const },
          },
        ],
      }
    : {};

  const users = await prisma.user.findMany({
    where,
    take: limit,
    skip,
    orderBy: { createdAt: "desc" },
    omit: { password: true },
  });

  const total = await prisma.user.count({ where });

  return {
    data: users,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

const updateUserStatusInDB = async (
  userId: string,
  payload: IUpdateUserStatus,
) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }
  if (user.role === "ADMIN") {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "Cannot change status of an admin",
    );
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { activeStatus: payload.activeStatus },
    omit: { password: true },
  });
  return updated;
};

const getAllPropertiesFromDB = async (query: IAdminQuery) => {
  const limit = query.limit ? Number(query.limit) : 10;
  const page = query.page ? Number(query.page) : 1;
  const skip = (page - 1) * limit;

  const properties = await prisma.property.findMany({
    take: limit,
    skip,
    orderBy: { createdAt: "desc" },
    include: {
      category: true,
      landlord: { select: { id: true, name: true, email: true } },
    },
  });

  const total = await prisma.property.count();

  return {
    data: properties,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

const getAllRentalRequestsFromDB = async (query: IAdminQuery) => {
  const limit = query.limit ? Number(query.limit) : 10;
  const page = query.page ? Number(query.page) : 1;
  const skip = (page - 1) * limit;

  const rentals = await prisma.rentalRequest.findMany({
    take: limit,
    skip,
    orderBy: { createdAt: "desc" },
    include: {
      property: true,
      tenant: { select: { id: true, name: true, email: true } },
      payment: true,
    },
  });

  const total = await prisma.rentalRequest.count();

  return {
    data: rentals,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

export const adminService = {
  getAllUsersFromDB,
  updateUserStatusInDB,
  getAllPropertiesFromDB,
  getAllRentalRequestsFromDB,
};
