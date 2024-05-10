import { QueryTypes } from "sequelize";
import {
  ErrorResponse,
  LoginSuccessResponse,
  SignupSuccessResponse,
} from "../@types/ApiResponse";
import { Users, instance } from "../sql/db";

import { sign } from "./jwt";

export async function handleRegistration(
  username: string,
  password: string
): Promise<SignupSuccessResponse | ErrorResponse> {
  try {
    const user = await Users.findOne({ where: { username } });

    if (user !== null) {
      return {
        success: false,
        statusCode: 400,
        message: "Username already exists.",
      };
    }

    await instance.query(
      `INSERT INTO
        users (username, password)
        VALUES ($1, crypt($2, gen_salt('bf')));`,
      {
        bind: [username, password],
        type: QueryTypes.INSERT,
      }
    );

    return {
      success: true,
      statusCode: 201,
      message: "Registration successful.",
    };
  } catch (e) {
    return {
      success: false,
      statusCode: 500,
      message: "Internal server error.",
    };
  }
}

export async function handleLogin(
  username: string,
  password: string
): Promise<LoginSuccessResponse | ErrorResponse> {
  const user = await instance.query(
    `SELECT
        id, username
    FROM
        users
    WHERE
        username = $1
        AND password = crypt ($2, password);`,
    {
      bind: [username, password],
      type: QueryTypes.SELECT,
    }
  );

  if (user.length === 0) {
    return {
      success: false,
      statusCode: 401,
      message: "Invalid credentials.",
    };
  }
  const dbUser = user[0] as {
    id: number;
    username: string;
  };

  const accessToken = await sign(
    { id: dbUser.id, username: dbUser.username },
    "1h"
  );
  const refreshToken = await sign(
    { id: dbUser.id, username: dbUser.username },
    "30d"
  );

  return {
    success: true,
    statusCode: 200,
    message: "Login successful.",
    accessToken,
    refreshToken,
    username: dbUser.username,
  };
}
