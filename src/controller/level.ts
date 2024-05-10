import express, { Request, Response } from "express";
import { jwtDecode } from "jwt-decode";
import { SnakeMapData, snakeMapDataSchema } from "../@types/SnakeMap";
import protectedMiddleware from "../middlewares/authentificationToken";

import { DefaultMaps, OnlineMaps, Users } from "../sql/db";
import { sendApiResponse } from "../util/ExpressUtil";

const levelRouter = express.Router();

levelRouter.get("/", (_: Request, res: Response) => {
  DefaultMaps.count().then((maps) => {
    sendApiResponse(res, 200, {
      success: true,
      message: "Levels found",
      statusCode: 200,
      data: maps,
    });
  });
});

levelRouter.get(
  "/upload/:id",
  protectedMiddleware,
  async (req: Request, res: Response) => {
    try {
      const jwt = jwtDecode(req.headers.authorization || "");

      if (!("id" in jwt)) {
        sendApiResponse(res, 400, {
          success: false,
          message: "Invalid token",
          statusCode: 400,
        });
        return;
      }

      OnlineMaps.findOne({
        where: {
          id: req.params.id,
        },
        include: [
          {
            model: Users,
            as: "creator",
          },
        ],
      }).then((map) => {
        if (!map) {
          sendApiResponse(res, 404, {
            success: false,
            message: "Map not found",
            statusCode: 404,
          });
          return;
        }

        if (map.creator_id !== jwt["id"]) {
          sendApiResponse(res, 403, {
            success: false,
            message: "You don't have access to this map",
            statusCode: 403,
          });
          return;
        }

        sendApiResponse(res, 200, {
          success: true,
          message: "Map found",
          statusCode: 200,
          data: map,
        });
        return;
      });
    } catch (error) {
      sendApiResponse(res, 500, {
        success: false,
        message: "Internal server error",
        statusCode: 500,
      });
      return;
    }
  }
);

levelRouter.post(
  "/upload",
  protectedMiddleware,
  async (req: Request, res: Response) => {
    try {
      const data: unknown = req.body;

      const snakeMapData: SnakeMapData = snakeMapDataSchema.parse(data);

      const jwt = jwtDecode(req.headers.authorization || "");

      if (!("id" in jwt)) {
        sendApiResponse(res, 400, {
          success: false,
          message: "Invalid token",
          statusCode: 400,
        });
        return;
      }

      OnlineMaps.upsert({
        id: snakeMapData.uuid,
        map_data: JSON.stringify(snakeMapData),
        created_at: new Date(),
        updated_at: new Date(),
        creator_id: jwt["id"] as number,
      });

      sendApiResponse(res, 200, {
        success: true,
        message: "Level uploaded",
        statusCode: 200,
      });
      return;
    } catch (error) {
      sendApiResponse(res, 500, {
        success: false,
        message: "Internal server error",
        statusCode: 500,
      });
    }
  }
);

levelRouter.get("/:id", (req: Request, res: Response) => {
  DefaultMaps.findOne({
    where: {
      id: req.params.id,
    },
  }).then((map) => {
    if (!map) {
      sendApiResponse(res, 404, {
        success: false,
        message: "Map not found",
        statusCode: 404,
      });
      return;
    }

    sendApiResponse(res, 200, {
      success: true,
      message: "Map found",
      statusCode: 200,
      data: map.map_data,
    });
    return;
  });
});

export default levelRouter;
