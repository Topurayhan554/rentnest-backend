import { RentalStatus } from "../../../generated/prisma/browser";

export interface ICreateRentalRequest {
  propertyId: string;
  moveInDate?: string;
  message?: string;
}

export interface IUpdateRentalRequestStatus {
  status: RentalStatus;
}

export interface IRentalRequestQuery {
  status?: RentalStatus;
  page?: string;
  limit?: string;
}
