import express, { Request, Response } from "express";
import { jwtDecode } from "jwt-decode";
import { ScenarioData, scenarioDataSchema } from "../@types/SnakeMap";
import protectedMiddleware from "../middlewares/authentificationToken";

import { Op } from "sequelize";
import { ErrorResponse } from "../@types/ApiResponse";
import {
  DefaultMapCompletion,
  DefaultMapCompletionSchema,
  OnlineMapCompletionSchema,
} from "../@types/MapCompletion";
import { OnlineMapFilterSchema } from "../@types/OnlineMap";
import {
  DefaultMapCompletions,
  DefaultMaps,
  OnlineMapCompletions,
  OnlineMaps,
  Users,
} from "../sql/db";
import { sendApiResponse } from "../util/ExpressUtil";

const levelRouter = express.Router();

levelRouter.get("/preview", async (req: Request, res: Response) => {
  const accessToken = req.headers["authorization"];

  if (!accessToken) {
    await DefaultMaps.findAll({
      attributes: ["id", "map_data"],
    }).then((maps) => {
      const result = maps.map((map) => {
        const data = JSON.parse(map.map_data) as ScenarioData;
        const { options } = data;
        const preview = data.maps.shift();
        return {
          id: map.id,
          preview: { options, ...preview },
          name: data.options.name,
          completed: false,
        };
      });

      sendApiResponse(res, 200, {
        success: true,
        message: "Levels found",
        statusCode: 200,
        data: result,
      });
    });

    return;
  }

  const { id } = jwtDecode(accessToken) as { id: number };

  const maps = await DefaultMaps.findAll({
    include: [
      {
        model: DefaultMapCompletions,
        as: "completions",
        where: { userId: id },
        required: false,
        attributes: ["completionTime"],
      },
    ],
    attributes: ["id", "map_data"],
  });

  const result = maps.map((map) => {
    let completed = map.completions && map.completions.length > 0;

    const data = JSON.parse(map.map_data) as ScenarioData;
    const { options } = data;
    const preview = data.maps.shift();

    return {
      id: map.id,
      preview: { options, ...preview },
      completed: completed,
      completionTime: completed ? map.completions?.at(0)?.completionTime : null,
    };
  });

  sendApiResponse(res, 200, {
    success: true,
    message: "Levels found",
    statusCode: 200,
    data: result,
  });
});

levelRouter.post(
  "/online/completion",
  protectedMiddleware,
  async (req: Request, res: Response) => {
    const accessToken = req.headers["authorization"];

    if (!accessToken) {
      sendApiResponse(res, 400, {
        success: false,
        message: "Invalid token",
        statusCode: 400,
      });
      return;
    }

    let userId = null;
    try {
      const { id } = jwtDecode(accessToken) as { id: number };
      userId = id;
    } catch (error) {}

    if (!userId) {
      sendApiResponse<ErrorResponse>(res, 400, {
        success: false,
        message: "Invalid token",
        statusCode: 400,
      });
      return;
    }

    const data: unknown = { userId, ...req.body };
    let validatedData = null;

    try {
      validatedData = OnlineMapCompletionSchema.parse(data);
    } catch (_) {}

    if (validatedData === null) {
      sendApiResponse<ErrorResponse>(res, 400, {
        success: false,
        message: "Invalid data",
        statusCode: 400,
      });
      return;
    }

    try {
      const existingCompletion = await OnlineMapCompletions.findOne({
        where: {
          userId: userId,
          mapId: validatedData.mapId,
        },
      });

      if (existingCompletion) {
        if (
          validatedData.completionTime <
          new Date(existingCompletion.completionTime).getTime()
        ) {
          await existingCompletion.update({
            completionTime: new Date(validatedData.completionTime),
            completionDate: new Date(validatedData.completionDate),
          });
          sendApiResponse(res, 200, {
            success: true,
            message: "Level completion updated",
            statusCode: 200,
          });
          return;
        } else {
          sendApiResponse(res, 200, {
            success: true,
            message: "Existing completion is faster",
            statusCode: 200,
          });
          return;
        }
      } else {
        await OnlineMapCompletions.create({
          userId: validatedData.userId,
          mapId: validatedData.mapId,
          completionTime: new Date(validatedData.completionTime),
          completionDate: new Date(validatedData.completionDate),
        });
        sendApiResponse(res, 201, {
          success: true,
          message: "Level completion registered",
          statusCode: 201,
        });
        return;
      }
    } catch (err) {
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
  "/campaign/completion",
  protectedMiddleware,
  async (req: Request, res: Response) => {
    const accessToken = req.headers["authorization"];

    if (!accessToken) {
      sendApiResponse(res, 400, {
        success: false,
        message: "Invalid token",
        statusCode: 400,
      });
      return;
    }
    let userId = null;
    try {
      const { id } = jwtDecode(accessToken) as { id: number };
      userId = id;
    } catch (error) {}

    if (!userId) {
      sendApiResponse<ErrorResponse>(res, 400, {
        success: false,
        message: "Invalid token",
        statusCode: 400,
      });
      return;
    }

    const data: unknown = { userId, ...req.body };

    let validatedData = null;
    try {
      validatedData = DefaultMapCompletionSchema.parse(data);
    } catch (_) {}

    if (validatedData === null) {
      sendApiResponse<ErrorResponse>(res, 400, {
        success: false,
        message: "Invalid data",
        statusCode: 400,
      });
      return;
    }

    try {
      const existingCompletion = await DefaultMapCompletion.findOne({
        where: {
          userId: userId,
          mapId: validatedData.mapId,
        },
      });

      if (existingCompletion) {
        if (
          validatedData.completionTime <
          new Date(existingCompletion.completionTime).getTime()
        ) {
          await existingCompletion.update({
            completionTime: new Date(validatedData.completionTime),
            completionDate: new Date(validatedData.completionDate),
          });
          sendApiResponse(res, 200, {
            success: true,
            message: "Level completion updated",
            statusCode: 200,
          });
          return;
        } else {
          sendApiResponse(res, 200, {
            success: true,
            message: "Existing completion is faster",
            statusCode: 200,
          });
          return;
        }
      } else {
        await DefaultMapCompletions.create({
          userId: validatedData.userId,
          mapId: validatedData.mapId,
          completionTime: new Date(validatedData.completionTime),
          completionDate: new Date(validatedData.completionDate),
        });
        sendApiResponse(res, 201, {
          success: true,
          message: "Level completion registered",
          statusCode: 201,
        });
        return;
      }
    } catch (err) {
      sendApiResponse(res, 500, {
        success: false,
        message: "Internal server error",
        statusCode: 500,
      });
      return;
    }
  }
);

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

levelRouter.delete(
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

        map.destroy();

        sendApiResponse(res, 200, {
          success: true,
          message: "Map deleted",
          statusCode: 200,
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

levelRouter.get("/online/:id", async (req: Request, res: Response) => {
  OnlineMaps.findOne({
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

levelRouter.get(
  "/create",
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

      const maps = await OnlineMaps.findAll({
        // @ts-ignore
        where: {
          creator_id: jwt["id"],
        },
      }).then((maps) => {
        return maps.map((map) => {
          const data = JSON.parse(map.map_data) as ScenarioData;
          const { options } = data;
          const preview = data.maps.shift();
          return {
            id: map.id,
            options,
            ...preview,
          };
        });
      });

      if (maps.length === 0) {
        sendApiResponse(res, 204, {
          success: false,
          message: "No maps found",
          statusCode: 204,
        });
        return;
      }

      //   const { options } = maps;
      //   const preview = data.maps.shift();
      //   return {
      //     id: map.id,
      //     preview: { options, ...preview },
      //     name: data.options.name,
      //     completed: false,
      //   };
      // });

      sendApiResponse(res, 200, {
        success: true,
        message: "Maps found",
        statusCode: 200,
        data: maps,
      });
      return;
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

type WhereClause = {
  [key: string]:
    | {
        [Op.like]?: string;
      }
    | {
        [Op.eq]?: number | string | boolean;
      }
    | boolean
    | string;
};

levelRouter.get("/upload", async (req: Request, res: Response) => {
  try {
    const validatedFilter = OnlineMapFilterSchema.parse(req.query);

    const whereClause: WhereClause = {};
    if (validatedFilter.name) {
      whereClause["name"] = {
        [Op.like]: `%${validatedFilter.name}%`,
      };
    }

    if (validatedFilter.difficulty) {
      whereClause["difficulty"] = {
        [Op.eq]: validatedFilter.difficulty,
      };
    }

    const { page, limit } = validatedFilter;

    const jwt = jwtDecode(req.headers.authorization || "");

    if (!("id" in jwt)) {
      sendApiResponse(res, 400, {
        success: false,
        message: "Invalid token",
        statusCode: 400,
      });
      return;
    }

    const { id } = jwt;

    const maps = await OnlineMaps.findAll({
      where: whereClause,
      limit,
      offset: (page - 1) * limit,
      include: [
        {
          model: Users,
          as: "creator",
          attributes: ["username"],
        },
        {
          model: OnlineMapCompletions,
          as: "completions",
          where: { userId: id },
          required: false,
          attributes: ["completionTime"],
        },
      ],
    }).then((maps) => {
      return maps.map((map) => {
        let completed = map.completions && map.completions.length > 0;

        if (!map.completions) {
          completed = false;
        }

        const data = JSON.parse(map.map_data);
        const { options } = data;
        const preview = data.maps.shift();
        return {
          id: map.id,
          preview: { options, ...preview },
          // @ts-ignore
          creatorName: map.creator.username,
          completed,
          completionTime: completed
            ? map.completions?.at(0)?.completionTime
            : null,
        };
      });
    });

    sendApiResponse(res, 200, {
      success: true,
      message: "Maps found",
      statusCode: 200,
      data: maps,
    });
  } catch (error) {
    sendApiResponse(res, 400, {
      success: false,
      message: "Invalid query parameters",
      statusCode: 400,
    });
    return;
  }
});

levelRouter.post(
  "/upload",
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

      const data: unknown = req.body;
      const validatedData: ScenarioData = scenarioDataSchema.parse(data);

      const { uuid, ...scenarioData } = validatedData;

      OnlineMaps.upsert({
        id: validatedData.uuid,
        map_data: JSON.stringify(scenarioData),
        created_at: new Date(),
        updated_at: new Date(),
        creator_id: jwt["id"] as number,
        difficulty: validatedData.options.difficulty,
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
