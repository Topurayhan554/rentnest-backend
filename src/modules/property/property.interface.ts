import { PropertyType } from "../../../generated/prisma/enums";

export interface ICreateProperty {
  title: string;
  description: string;
  location: string;
  price: number;
  type: PropertyType;
  amenities?: string[];
  images?: string[];
  categoryId: string;
}

export interface IUpdateProperty {
  title?: string;
  description?: string;
  location?: string;
  price?: number;
  type?: PropertyType;
  amenities?: string[];
  images?: string[];
  isAvailable?: boolean;
  categoryId?: string;
}

export interface IPropertyQuery {
  searchTerm?: string;
  location?: string;
  minPrice?: string;
  maxPrice?: string;
  type?: PropertyType;
  categoryId?: string;
  page?: string;
  limit?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}
