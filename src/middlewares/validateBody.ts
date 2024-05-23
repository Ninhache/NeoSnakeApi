import express, { NextFunction, Request, Response } from "express";

import { ZodError, z } from "zod";
import { ErrorResponse } from "../@types/ApiResponse";
import { sendApiResponse } from "../util/ExpressUtil";

export const validateBody =
  (schema: z.ZodSchema) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        sendApiResponse<ErrorResponse>(res, 400, {
          success: false,
          statusCode: 400,
          message: `Some inputs need your fix : ${JSON.stringify(
            error.issues
          )}`,
        });
      } else {
        sendApiResponse<ErrorResponse>(res, 500, {
          success: false,
          statusCode: 500,
          message: "Internal server error.",
        });
      }
      return;
    }
  };
