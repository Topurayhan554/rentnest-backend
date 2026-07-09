import { ActiveStatus } from "../../../generated/prisma/enums";

export interface IUpdateUserStatus {
  activeStatus: ActiveStatus;
}

export interface IAdminQuery {
  page?: string;
  limit?: string;
  searchTerm?: string;
}
