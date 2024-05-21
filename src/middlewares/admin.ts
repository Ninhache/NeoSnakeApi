import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { ErrorResponse } from "../@types/ApiResponse";
import { Roles, Users } from "../db/init";
import { sendApiResponse } from "../util/ExpressUtil";

interface AuthRequest extends Request {
  user?: string | JwtPayload;
}

/**
 * Ensure to use the admin middleware chained with the @authtokenMiddleware to avoid ALL security errors:
 * since we're simply decoding the token, anyone could sign it with a random signature and pretend to be an admin or anything else.
 */
async function adminMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const refreshToken = req.headers["authorization"];

  try {
    const { id } = jwt.decode(refreshToken || "") as { id: number };
    const user = await Users.findOne({
      where: {
        id,
      },
      include: [
        {
          model: Roles,
          attributes: ["id", "label"],
        },
      ],
    });

    if (user === null) {
      sendApiResponse<ErrorResponse>(res, 403, {
        message: "User is null, problem in the JWT token",
        statusCode: 403,
        success: false,
      });
    } else {
      // 1 is the admin role, so the most "powerfull"
      if (user.role_id === 1) {
        // user is granted
        next();
      } else {
        sendApiResponse<ErrorResponse>(res, 403, {
          success: false,
          statusCode: 403,
          message: "You're forbidden from doing that.",
        });
      }
    }
  } catch (e) {
    console.error(e);
    throw new Error("admin try catch");
  }
}

export default adminMiddleware;
