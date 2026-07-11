import httpStatus from "http-status";
import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { rentalRequestService } from "./rentalRequest.service";

const createRentalRequest = catchAsync(async (req: Request, res: Response) => {
  const request = await rentalRequestService.createRentalRequestIntoDB(
    req.user!.id,
    req.body,
  );
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Rental request submitted successfully",
    data: request,
  });
});

const getMyRentalRequests = catchAsync(async (req: Request, res: Response) => {
  const result = await rentalRequestService.getMyRentalRequestsFromDB(
    req.user!.id,
    req.query,
  );
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Your rental requests fetched successfully",
    data: result.data,
    meta: result.meta,
  });
});

const getLandlordRentalRequests = catchAsync(
  async (req: Request, res: Response) => {
    const result = await rentalRequestService.getLandlordRentalRequestsFromDB(
      req.user!.id,
      req.query,
    );
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Rental requests fetched successfully",
      data: result.data,
      meta: result.meta,
    });
  },
);

const getSingleRentalRequest = catchAsync(
  async (req: Request, res: Response) => {
    const request = await rentalRequestService.getSingleRentalRequestFromDB(
      req.params.id as string,
      req.user!.id,
      req.user!.role,
    );
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Rental request fetched successfully",
      data: request,
    });
  },
);

const updateRentalRequestStatus = catchAsync(
  async (req: Request, res: Response) => {
    const updated = await rentalRequestService.updateRentalRequestStatusInDB(
      req.params.id as string,
      req.user!.id,
      req.body,
    );
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Rental request status updated successfully",
      data: updated,
    });
  },
);

export const rentalRequestController = {
  createRentalRequest,
  getMyRentalRequests,
  getLandlordRentalRequests,
  getSingleRentalRequest,
  updateRentalRequestStatus,
};
