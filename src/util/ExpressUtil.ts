import { Request, Response } from "express";
import { ApiResponse } from "../@types/ApiResponse";

export function sendApiResponse<T extends ApiResponse>(
  res: Response,
  statusCode: number,
  data: T
): Response {
  return res.status(statusCode).json(data);
}
