import express from "express";

const authRouter = express.Router();

import {
  ErrorResponse,
  LoginSuccessResponse,
  RefreshSuccessResponse,
} from "../@types/ApiResponse";
import { Roles, Users } from "../db/init";
import { validateBody } from "../middlewares/validateBody";
import { loginSchema, signupSchema } from "../schema/auth";
import { handleLogin, handleRegistration } from "../services/auth";
import { sign, verify } from "../services/jwt";
import { sendApiResponse } from "../util/ExpressUtil";

function isErrorWithMessage(
  error: unknown
): error is Error & { code?: number } {
  return error instanceof Error;
}

authRouter.post(
  "/signup",
  validateBody(signupSchema),
  async (req, res): Promise<void> => {
    try {
      const registrationInfo = await handleRegistration(
        req.body.username,
        req.body.password
      );
      if (!registrationInfo.success) {
        sendApiResponse<ErrorResponse>(res, registrationInfo.statusCode, {
          success: false,
          statusCode: registrationInfo.statusCode,
          message: registrationInfo.message,
        });
        return;
      } else {
        const loginInfo = await handleLogin(
          req.body.username,
          req.body.password
        );

        if (!loginInfo.success) {
          sendApiResponse<ErrorResponse>(res, loginInfo.statusCode, {
            success: false,
            statusCode: loginInfo.statusCode,
            message: loginInfo.message,
          });
          return;
        }

        const { accessToken, refreshToken, username } = loginInfo;

        sendApiResponse<LoginSuccessResponse>(res, loginInfo.statusCode, {
          success: true,
          statusCode: loginInfo.statusCode,
          message: registrationInfo.message,
          accessToken,
          refreshToken,
          username,
        });
      }
    } catch (error) {
      if (isErrorWithMessage(error)) {
        sendApiResponse<ErrorResponse>(res, 400, {
          success: false,
          statusCode: 400,
          message: error.message,
        });
        return;
      }
      sendApiResponse<ErrorResponse>(res, 500, {
        success: false,
        statusCode: 500,
        message: "Internal server error.",
      });
      return;
    }
  }
);

authRouter.post(
  "/login",
  validateBody(loginSchema),
  async (req, res): Promise<void> => {
    try {
      const response = await handleLogin(req.body.username, req.body.password);

      if (!response.success) {
        sendApiResponse<ErrorResponse>(res, response.statusCode, {
          success: false,
          statusCode: response.statusCode,
          message: response.message,
        });
        return;
      }

      const { accessToken, refreshToken, username } = response;

      sendApiResponse<LoginSuccessResponse>(res, response.statusCode, {
        success: true,
        statusCode: response.statusCode,
        message: response.message,
        accessToken,
        refreshToken,
        username,
      });

      return;
    } catch (error) {
      sendApiResponse<ErrorResponse>(res, 500, {
        success: false,
        statusCode: 500,
        message: "Internal server error.",
      });
      return;
    }
  }
);

authRouter.get("/refresh", async (req, res) => {
  const currentRefreshToken = req.headers["authorization"];

  if (currentRefreshToken === undefined) {
    sendApiResponse<ErrorResponse>(res, 400, {
      success: false,
      statusCode: 400,
      message: "Refresh token is required.",
    });
    return;
  }

  try {
    const isRefreshTokenValid = (await verify(currentRefreshToken)) as {
      username: string;
      id: string;
      role: string;
    };

    if (typeof isRefreshTokenValid !== "object") {
      sendApiResponse<ErrorResponse>(res, 403, {
        success: false,
        statusCode: 403,
        message: "You're forbidden from doing that.",
      });
      return;
    }

    const user = await Users.findOne({
      where: { id: isRefreshTokenValid.id },
      include: [
        {
          model: Roles,
          attributes: ["id", "label"],
        },
      ],
    });

    if (!user) {
      sendApiResponse<ErrorResponse>(res, 403, {
        success: false,
        statusCode: 403,
        message: "You're forbidden from doing that.",
      });
      return;
    }

    const newAccessToken = await sign(
      {
        username: isRefreshTokenValid.username,
        id: isRefreshTokenValid.id,
        // @ts-ignore
        role: user.role.label,
      },
      "1h"
    );

    sendApiResponse<RefreshSuccessResponse>(res, 201, {
      success: true,
      statusCode: 201,
      message: "Access token created!",
      accessToken: newAccessToken,
    });
    return;
  } catch (error) {
    sendApiResponse<ErrorResponse>(res, 403, {
      success: false,
      statusCode: 403,
      message: "You're forbidden from doing that.",
    });
    return;
  }
});

export default authRouter;
