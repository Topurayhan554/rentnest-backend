import httpStatus from "http-status";
import { PropertyWhereInput } from "../../../generated/prisma/internal/prismaNamespaceBrowser";
import { prisma } from "../../lib/prisma";
import {
  ICreateProperty,
  IPropertyQuery,
  IUpdateProperty,
} from "./property.interface";
import { AppError } from "../../utils/app.Error";

const createPropertyIntoDB = async (
  landlordId: string,
  payload: ICreateProperty,
) => {
  const category = await prisma.category.findUnique({
    where: { id: payload.categoryId },
  });
  if (!category) {
    throw new AppError(httpStatus.NOT_FOUND, "Category not found");
  }

  const property = await prisma.property.create({
    data: { ...payload, landlordId },
  });
  return property;
};

const getAllPropertiesFromDB = async (query: IPropertyQuery) => {
  const limit = query.limit ? Number(query.limit) : 10;
  const page = query.page ? Number(query.page) : 1;
  const skip = (page - 1) * limit;
  const sortBy = query.sortBy ? query.sortBy : "createdAt";
  const sortOrder = query.sortOrder ? query.sortOrder : "desc";

  const andCondition: PropertyWhereInput[] = [{ isAvailable: true }];

  if (query.searchTerm) {
    andCondition.push({
      OR: [
        { title: { contains: query.searchTerm, mode: "insensitive" } },
        { description: { contains: query.searchTerm, mode: "insensitive" } },
        { location: { contains: query.searchTerm, mode: "insensitive" } },
      ],
    });
  }

  if (query.location) {
    andCondition.push({
      location: { contains: query.location, mode: "insensitive" },
    });
  }

  if (query.type) {
    andCondition.push({ type: query.type });
  }

  if (query.categoryId) {
    andCondition.push({ categoryId: query.categoryId });
  }

  if (query.minPrice || query.maxPrice) {
    andCondition.push({
      price: {
        ...(query.minPrice && { gte: Number(query.minPrice) }),
        ...(query.maxPrice && { lte: Number(query.maxPrice) }),
      },
    });
  }

  const properties = await prisma.property.findMany({
    where: { AND: andCondition },
    take: limit,
    skip: skip,
    orderBy: { [sortBy]: sortOrder },
    include: {
      category: true,
      landlord: { select: { id: true, name: true, email: true } },
    },
  });

  const totalCount = await prisma.property.count({
    where: { AND: andCondition },
  });

  return {
    data: properties,
    meta: {
      page,
      limit,
      total: totalCount,
      totalPages: Math.ceil(totalCount / limit),
    },
  };
};

const getSinglePropertyFromDB = async (id: string) => {
  const property = await prisma.property.findUnique({
    where: { id },
    include: {
      category: true,
      landlord: { select: { id: true, name: true, email: true } },
      reviews: { include: { tenant: { select: { id: true, name: true } } } },
    },
  });
  if (!property) {
    throw new AppError(httpStatus.NOT_FOUND, "Property not found");
  }
  return property;
};

const getMyPropertiesFromDB = async (landlordId: string) => {
  const properties = await prisma.property.findMany({
    where: { landlordId },
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });
  return properties;
};

const updatePropertyInDB = async (
  id: string,
  landlordId: string,
  payload: IUpdateProperty,
) => {
  const property = await prisma.property.findUnique({ where: { id } });
  if (!property) {
    throw new AppError(httpStatus.NOT_FOUND, "Property not found");
  }
  if (property.landlordId !== landlordId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not the owner of this property",
    );
  }

  const updated = await prisma.property.update({
    where: { id },
    data: payload,
  });
  return updated;
};

const deletePropertyFromDB = async (id: string, landlordId: string) => {
  const property = await prisma.property.findUnique({ where: { id } });
  if (!property) {
    throw new AppError(httpStatus.NOT_FOUND, "Property not found");
  }
  if (property.landlordId !== landlordId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not the owner of this property",
    );
  }

  await prisma.property.delete({ where: { id } });
  return null;
};

export const propertyService = {
  createPropertyIntoDB,
  getAllPropertiesFromDB,
  getSinglePropertyFromDB,
  getMyPropertiesFromDB,
  updatePropertyInDB,
  deletePropertyFromDB,
};
