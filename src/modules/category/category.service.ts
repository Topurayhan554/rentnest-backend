import httpStatus from "http-status";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/app.Error";
import { ICreateCategory, IUpdateCategory } from "./category.interface";

const createCategoryIntoDB = async (payload: ICreateCategory) => {
  const isExist = await prisma.category.findUnique({
    where: {
      name: payload.name,
    },
  });

  if (isExist) {
    throw new AppError(
      httpStatus.CONFLICT,
      "Category with this name already exist",
    );
  }

  const category = await prisma.category.create({
    data: payload,
  });

  return category;
};

const getAllCategoriesFromDB = async () => {
  const categories = await prisma.category.findMany({
    orderBy: {
      name: "asc",
    },
  });
  return categories;
};

const getSingleCategoryFromDB = async (id: string) => {
  const category = await prisma.category.findUnique({
    where: {
      id,
    },
  });
  if (!category) {
    throw new AppError(httpStatus.NOT_FOUND, "Category Not Found");
  }

  return category;
};

const updateCategoryInDB = async (id: string, payload: IUpdateCategory) => {
  const isExist = await prisma.category.findUnique({
    where: {
      id,
    },
  });

  if (!isExist) {
    throw new AppError(httpStatus.NOT_FOUND, "Category Not Found");
  }
};

const deleteCategoryFromDB = async (id: string) => {
  const isExist = await prisma.category.findUnique({
    where: {
      id,
    },
  });

  if (!isExist) {
    throw new AppError(httpStatus.NOT_FOUND, "Category Not Found");
  }

  const propertyCount = await prisma.property.count({
    where: {
      categoryId: id,
    },
  });

  if (propertyCount > 0) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Cannot delete category. Properties are linked to this category",
    );
  }

  await prisma.category.delete({
    where: {
      id,
    },
  });

  return null;
};

export const categoryService = {
  createCategoryIntoDB,
  getAllCategoriesFromDB,
  getSingleCategoryFromDB,
  updateCategoryInDB,
  deleteCategoryFromDB,
};
