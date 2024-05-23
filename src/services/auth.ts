import { QueryTypes } from "sequelize";
import {
  ErrorResponse,
  LoginSuccessResponse,
  SignupSuccessResponse,
} from "../@types/ApiResponse";
import { Roles, Users, instance } from "../db/init";

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
        users (username, password, role_id)
        VALUES ($1, crypt($2, gen_salt('bf')), 2);`,
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
    console.error(e);
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
  const user = await Users.findOne({
    attributes: ["id", "username"], // Select fields
    where: {
      username,
      password: instance.fn("crypt", password, instance.col("password")),
    },
    include: [
      {
        model: Roles,
        attributes: ["label"],
      },
    ],
  });

  if (user === null) {
    return {
      success: false,
      statusCode: 401,
      message: "Invalid credentials.",
    };
  }

  const accessToken = await sign(
    {
      id: user.id,
      username: user.username,
      // @ts-ignore
      role: user.role.label,
    },
    "1h"
  );
  const refreshToken = await sign(
    {
      id: user.id,
      username: user.username,
      // @ts-ignore
      role: user.role.label,
    },
    "30d"
  );

  return {
    success: true,
    statusCode: 200,
    message: "Login successful.",
    accessToken,
    refreshToken,
    username: user.username,
  };
}
