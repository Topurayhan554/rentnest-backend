import httpStatus from "http-status";
import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { propertyService } from "./property.service";

const createProperty = catchAsync(async (req: Request, res: Response) => {
  const property = await propertyService.createPropertyIntoDB(
    req.user!.id,
    req.body,
  );
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Property created successfully",
    data: property,
  });
});

const getAllProperties = catchAsync(async (req: Request, res: Response) => {
  const result = await propertyService.getAllPropertiesFromDB(req.query);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Properties fetched successfully",
    data: result.data,
    meta: result.meta,
  });
});

const getSingleProperty = catchAsync(async (req: Request, res: Response) => {
  const property = await propertyService.getSinglePropertyFromDB(req.params.id);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Property fetched successfully",
    data: property,
  });
});

const getMyProperties = catchAsync(async (req: Request, res: Response) => {
  const properties = await propertyService.getMyPropertiesFromDB(req.user!.id);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Your properties fetched successfully",
    data: properties,
  });
});

const updateProperty = catchAsync(async (req: Request, res: Response) => {
  const property = await propertyService.updatePropertyInDB(
    req.params.id as string,
    req.user!.id,
    req.body,
  );
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Property updated successfully",
    data: property,
  });
});

const deleteProperty = catchAsync(async (req: Request, res: Response) => {
  await propertyService.deletePropertyFromDB(
    req.params.id as string,
    req.user!.id,
  );
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Property deleted successfully",
    data: null,
  });
});

export const propertyController = {
  createProperty,
  getAllProperties,
  getSingleProperty,
  getMyProperties,
  updateProperty,
  deleteProperty,
};
