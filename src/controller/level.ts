import express, { Request, Response } from "express";
import { jwtDecode } from "jwt-decode";

import authtokenMiddleware from "../middlewares/authentificationToken";

import { Op } from "sequelize";
import {
  CampaignPreviewResponse,
  ErrorResponse,
  GetAllUploadSuccessResponse,
  GetCampaignByIdResponse,
  GetCreatePreviewSuccessResponse,
  GetOnlineMapByIdSuccessResponse,
  SuccessResponse,
} from "../@types/ApiResponse";
import { CampaignMapCompletion } from "../@types/db/MapCompletion";

import { CampaignData, OnlineData } from "../@types/Map";
import adminMiddleware from "../middlewares/admin";
import { CampaignMapCompletionSchema } from "../schema/campaign";
import { OnlineMapFilterSchema, PaginationSchema } from "../schema/filters";
import { campaignDataSchema, onlineDataSchema } from "../schema/map";
import { OnlineMapCompletionSchema } from "../schema/online";
import {
  CampaignMapCompletions,
  CampaignMaps,
  OnlineMapCompletions,
  OnlineMaps,
  Users,
} from "../db/init";
import { sendApiResponse } from "../util/ExpressUtil";

const levelRouter = express.Router();

levelRouter.get("/campaign", async (req: Request, res: Response) => {
  try {
    const accessToken = req.headers["authorization"];

    if (!accessToken) {
      await CampaignMaps.findAll({
        attributes: ["id", "map_data"],
      }).then((maps) => {
        const result = maps.map((map) => {
          const data = JSON.parse(map.map_data) as CampaignData;
          const { options } = data;
          const preview = data.maps.shift();

          if (!preview) {
            throw new Error("Problem getting the preview map data");
          }

          const { fruits, obstacles } = preview;

          return {
            id: map.id,
            preview: { options, fruits, obstacles },
            name: data.options.name,
            completed: false,
          };
        });

        if (result.length === 0) {
          sendApiResponse<ErrorResponse>(res, 204, {
            success: false,
            message: "No levels found",
            statusCode: 204,
          });
          return;
        }

        sendApiResponse<CampaignPreviewResponse>(res, 200, {
          success: true,
          message: "Levels found",
          statusCode: 200,
          data: result,
        });
      });

      return;
    }

    const { id } = jwtDecode(accessToken) as { id: number };

    const maps = await CampaignMaps.findAll({
      include: [
        {
          model: CampaignMapCompletions,
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

      const data = JSON.parse(map.map_data) as CampaignData;
      const { options } = data;
      const preview = data.maps.shift();

      return {
        id: map.id,
        preview: { options, ...preview },
        completed: completed,
        completionTime: completed
          ? map.completions?.at(0)?.completionTime
          : null,
      };
    });

    sendApiResponse(res, 200, {
      success: true,
      message: "Levels found",
      statusCode: 200,
      data: result,
    });
  } catch (error) {
    console.log("AAA", error);
    sendApiResponse<ErrorResponse>(res, 500, {
      success: false,
      message: "Internal server error",
      statusCode: 500,
    });
  }
});

levelRouter.get("/campaign/:id", (req: Request, res: Response) => {
  CampaignMaps.findOne({
    where: {
      id: req.params.id,
    },
  }).then((map) => {
    if (!map) {
      sendApiResponse<ErrorResponse>(res, 404, {
        success: false,
        message: "Map not found",
        statusCode: 404,
      });
      return;
    }

    if (!map.map_data) {
      sendApiResponse<ErrorResponse>(res, 500, {
        success: false,
        message: "Map data corrupted",
        statusCode: 500,
      });
      return;
    }

    sendApiResponse<GetCampaignByIdResponse>(res, 200, {
      success: true,
      message: "Map found",
      statusCode: 200,
      data: JSON.parse(map.map_data) as OnlineData,
    });
    return;
  });
});

levelRouter.put(
  "/campaign/completion",
  authtokenMiddleware,
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
      validatedData = CampaignMapCompletionSchema.parse(data);
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
      const existingCompletion = await CampaignMapCompletion.findOne({
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
          sendApiResponse<SuccessResponse>(res, 200, {
            success: true,
            message: "Level completion updated",
            statusCode: 200,
          });
          return;
        } else {
          sendApiResponse<SuccessResponse>(res, 200, {
            success: true,
            message: "Existing completion is faster",
            statusCode: 200,
          });
          return;
        }
      } else {
        await CampaignMapCompletions.create({
          userId: validatedData.userId,
          mapId: validatedData.mapId,
          completionTime: new Date(validatedData.completionTime),
          completionDate: new Date(validatedData.completionDate),
        });
        sendApiResponse<SuccessResponse>(res, 201, {
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

levelRouter.put(
  "/campaign",
  authtokenMiddleware,
  adminMiddleware,
  async (req: Request, res: Response) => {
    try {
      const data: unknown = req.body;
      // @ts-ignore
      console.log(data);
      console.log("----------------------");
      const validatedData: CampaignData = campaignDataSchema.parse(data);

      const { id, ...scenarioData } = validatedData;

      CampaignMaps.upsert({
        id,
        map_data: JSON.stringify(scenarioData),
      }).then(() => {
        sendApiResponse<SuccessResponse>(res, 201, {
          success: true,
          message: "Level uploaded",
          statusCode: 201,
        });

        CampaignMapCompletions.destroy({
          where: {
            mapId: validatedData.id,
          },
        });
      });
    } catch (error) {
      console.log(error);
      sendApiResponse<ErrorResponse>(res, 500, {
        success: false,
        message: "Internal server error",
        statusCode: 500,
      });
    }
  }
);

levelRouter.get("/online/:id", async (req: Request, res: Response) => {
  try {
    OnlineMaps.findOne({
      where: {
        id: req.params.id,
      },
    }).then((map) => {
      if (!map) {
        sendApiResponse<ErrorResponse>(res, 404, {
          success: false,
          message: "Map not found",
          statusCode: 404,
        });
      } else {
        sendApiResponse<GetOnlineMapByIdSuccessResponse>(res, 200, {
          success: true,
          message: "Map found",
          statusCode: 200,
          data: map,
        });
      }
    });
  } catch (error) {
    sendApiResponse<ErrorResponse>(res, 500, {
      success: false,
      message: "Internal server error",
      statusCode: 500,
    });
  }
});

levelRouter.post(
  "/online/completion",
  authtokenMiddleware,
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
levelRouter.get(
  "/upload/:id",
  authtokenMiddleware,
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
            attributes: ["id", "username"],
          },
        ],
      }).then((map) => {
        if (!map) {
          sendApiResponse<ErrorResponse>(res, 404, {
            success: false,
            message: "Map not found",
            statusCode: 404,
          });
          return;
        }

        if (map.creator_id !== jwt["id"]) {
          sendApiResponse<ErrorResponse>(res, 403, {
            success: false,
            message: "You don't have access to this map",
            statusCode: 403,
          });
          return;
        }

        sendApiResponse<GetOnlineMapByIdSuccessResponse>(res, 200, {
          success: true,
          message: "Map found",
          statusCode: 200,
          data: map,
        });
        return;
      });
    } catch (error) {
      sendApiResponse<ErrorResponse>(res, 500, {
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
  authtokenMiddleware,
  async (req: Request, res: Response) => {
    try {
      const jwt = jwtDecode(req.headers.authorization || "");

      if (!("id" in jwt)) {
        sendApiResponse<ErrorResponse>(res, 400, {
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
          sendApiResponse<ErrorResponse>(res, 404, {
            success: false,
            message: "Map not found",
            statusCode: 404,
          });
          return;
        }

        if (map.creator_id !== jwt["id"]) {
          sendApiResponse<ErrorResponse>(res, 403, {
            success: false,
            message: "You don't have access to this map",
            statusCode: 403,
          });
          return;
        }

        map.destroy();

        sendApiResponse<SuccessResponse>(res, 200, {
          success: true,
          message: "Map deleted",
          statusCode: 200,
        });
        return;
      });
    } catch (error) {
      sendApiResponse<ErrorResponse>(res, 500, {
        success: false,
        message: "Internal server error",
        statusCode: 500,
      });
      return;
    }
  }
);

levelRouter.get(
  "/create",
  authtokenMiddleware,
  async (req: Request, res: Response) => {
    try {
      const jwt = jwtDecode(req.headers.authorization || "");

      if (!("id" in jwt)) {
        sendApiResponse<ErrorResponse>(res, 400, {
          success: false,
          message: "Invalid token",
          statusCode: 400,
        });
        return;
      }

      const { page, limit, sortDate, difficulty } = OnlineMapFilterSchema.merge(
        PaginationSchema
      ).parse(req.query);

      const whereClause: WhereClause = {};

      if (difficulty) {
        whereClause["difficulty"] = {
          [Op.eq]: Number(difficulty),
        };
      }

      whereClause["creator_id"] = jwt["id"] as string;

      const totalMaps = await OnlineMaps.count({
        where: whereClause,
      });

      const totalItems = await OnlineMaps.count({});

      OnlineMaps.findAll({
        limit,
        offset: (page - 1) * limit,
        order: [["updated_at", sortDate]],
        where: whereClause,
      })
        .then((maps) => {
          return maps.map((map) => {
            const data = JSON.parse(map.map_data) as OnlineData;
            const { options } = data;
            const preview = data.maps.shift();

            if (!preview) {
              throw new Error("Problem getting the preview map data");
            }

            const { fruits, obstacles } = preview;

            return {
              id: map.id,
              options,
              fruits,
              obstacles,
            };
          });
        })
        .then((maps) => {
          if (maps.length === 0) {
            sendApiResponse<ErrorResponse>(res, 204, {
              success: false,
              message: "No maps found",
              statusCode: 204,
            });
          } else {
            sendApiResponse<GetCreatePreviewSuccessResponse>(res, 200, {
              success: true,
              message: "Maps found",
              statusCode: 200,
              data: maps,
              pagination: {
                totalItems: totalMaps,
                totalPages: Math.ceil(totalMaps / limit),
                pageSize: limit,
                currentPage: page,
              },
            });
          }
        });
    } catch (error) {
      sendApiResponse<ErrorResponse>(res, 500, {
        success: false,
        message: "Internal server error",
        statusCode: 500,
      });
    }
  }
);

levelRouter.get("/create/:username", async (req: Request, res: Response) => {
  try {
    const { username } = req.params;

    const { limit, page } = PaginationSchema.parse(req.query);

    const totalItems = await OnlineMaps.count({
      include: [
        {
          model: Users,
          as: "creator",
          attributes: ["username"],
          where: {
            username: {
              [Op.eq]: `${username}`,
            },
          },
        },
      ],
    });

    const accessToken = req.headers["authorization"];

    if (!accessToken) {
      OnlineMaps.findAll({
        limit,
        offset: (page - 1) * limit,
        order: [["updated_at", "desc"]],
        include: [
          {
            model: Users,
            as: "creator",
            attributes: ["username"],
            where: {
              username: {
                [Op.eq]: `${username}`,
              },
            },
          },
        ],
      })
        .then((maps) => {
          return maps.map((map) => {
            const data = JSON.parse(map.map_data) as OnlineData;
            const { options } = data;
            const preview = data.maps.shift();

            if (!preview) {
              throw new Error("Problem getting the preview map data");
            }

            const { fruits, obstacles } = preview;

            return {
              id: map.id,
              options,
              fruits,
              obstacles,
              completed: false,
            };
          });
        })
        .then((maps) => {
          if (maps && maps.length === 0) {
            sendApiResponse<ErrorResponse>(res, 204, {
              success: false,
              message: "No maps found",
              statusCode: 204,
            });
          } else {
            sendApiResponse<GetAllUploadSuccessResponse>(res, 200, {
              success: true,
              message: "Levels found",
              statusCode: 200,
              data: maps,
              pagination: {
                totalItems,
                totalPages: Math.ceil(totalItems / limit),
                pageSize: limit,
                currentPage: page,
              },
            });
          }
        });
    } else {
      const jwt = jwtDecode(accessToken || "");

      if (!("id" in jwt)) {
        sendApiResponse<ErrorResponse>(res, 400, {
          success: false,
          message: "Invalid token",
          statusCode: 400,
        });
        return;
      }

      const { id } = jwt;

      OnlineMaps.findAll({
        limit,
        offset: (page - 1) * limit,
        order: [["updated_at", "desc"]],
        include: [
          {
            model: Users,
            as: "creator",
            attributes: ["username"],
            where: {
              username: {
                [Op.eq]: `${username}`,
              },
            },
          },
          {
            model: OnlineMapCompletions,
            as: "completions",
            required: false,
            where: {
              userId: id,
            },
            attributes: ["completionTime"],
          },
        ],
      })
        .then((maps) => {
          return maps.map((map) => {
            let completed = map.completions && map.completions.length > 0;

            const data = JSON.parse(map.map_data) as OnlineData;
            const { options } = data;
            const preview = data.maps.shift();

            if (!preview) {
              throw new Error("Problem getting the preview map data");
            }

            const { fruits, obstacles } = preview;

            return {
              id: map.id,
              options,
              fruits,
              obstacles,
              completed: completed,
              completionTime: completed
                ? map.completions?.at(0)?.completionTime
                : null,
            };
          });
        })
        .then((maps) => {
          if (maps.length === 0) {
            sendApiResponse<ErrorResponse>(res, 204, {
              success: false,
              message: "No maps found",
              statusCode: 204,
            });
          } else {
            console.log("no maps found");
            sendApiResponse<GetCreatePreviewSuccessResponse>(res, 200, {
              success: true,
              message: "Maps found",
              statusCode: 200,
              data: maps,
              pagination: {
                totalItems: totalItems,
                totalPages: Math.ceil(totalItems / limit),
                pageSize: limit,
                currentPage: page,
              },
            });
          }
        });
    }
  } catch (error) {
    console.error(error);
    sendApiResponse<ErrorResponse>(res, 500, {
      success: false,
      message: "Internal server error",
      statusCode: 500,
    });
  }
});

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
    const validatedFilter = OnlineMapFilterSchema.merge(PaginationSchema).parse(
      req.query
    );

    console.log(validatedFilter);

    const whereClause: WhereClause = {};

    if (validatedFilter.difficulty) {
      whereClause["difficulty"] = {
        [Op.eq]: Number(validatedFilter.difficulty),
      };
    }

    const { page, limit } = validatedFilter;

    const totalItems = await OnlineMaps.count({
      where: whereClause,
    });

    const accessToken = req.headers["authorization"];

    if (!accessToken) {
      OnlineMaps.findAll({
        where: whereClause,
        limit,
        order: [["updated_at", validatedFilter.sortDate]],
        offset: (page - 1) * limit,
        include: [
          {
            model: Users,
            as: "creator",
            attributes: ["username"],
            where: validatedFilter.name
              ? {
                  username: {
                    [Op.like]: `%${validatedFilter.name}%`,
                  },
                }
              : undefined,
          },
        ],
        attributes: ["id", "map_data"],
      }).then((maps) => {
        const result = maps.map((map) => {
          const data = JSON.parse(map.map_data) as OnlineData;
          const { options } = data;
          const preview = data.maps.shift();

          if (!preview) {
            throw new Error("Problem getting the preview map data");
          }

          const { fruits, obstacles } = preview;

          return {
            id: map.id,
            creatorName: (map as any).creator.username as string,
            options,
            fruits,
            obstacles,
            name: data.options.name,
            completed: false,
          };
        });

        sendApiResponse<GetAllUploadSuccessResponse>(res, 200, {
          success: true,
          message: "Levels found",
          statusCode: 200,
          data: result,
          pagination: {
            totalItems,
            totalPages: Math.ceil(totalItems / limit),
            pageSize: limit,
            currentPage: page,
          },
        });
      });
    } else {
      const jwt = jwtDecode(accessToken || "");

      if (!("id" in jwt)) {
        sendApiResponse<ErrorResponse>(res, 400, {
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
        order: [["updated_at", validatedFilter.sortDate]],
        offset: (page - 1) * limit,
        include: [
          {
            model: Users,
            as: "creator",
            attributes: ["username"],
            where: validatedFilter.name
              ? {
                  username: {
                    [Op.like]: `%${validatedFilter.name}%`,
                  },
                }
              : undefined,
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

          const { fruits, obstacles } = preview;

          return {
            id: map.id,
            options,
            fruits,
            obstacles,
            creatorName: (map as any).creator.username as string,
            completed,
            completionTime: completed
              ? map.completions?.at(0)?.completionTime
              : null,
          };
        });
      });

      if (maps.length === 0) {
        sendApiResponse<ErrorResponse>(res, 204, {
          success: false,
          message: "No maps found",
          statusCode: 204,
        });
      } else {
        sendApiResponse<GetAllUploadSuccessResponse>(res, 200, {
          success: true,
          message: "Maps found",
          statusCode: 200,
          data: maps,
          pagination: {
            totalItems,
            totalPages: Math.ceil(totalItems / limit),
            pageSize: limit,
            currentPage: page,
          },
        });
      }
    }
  } catch (error) {
    console.error(error);
    sendApiResponse<ErrorResponse>(res, 400, {
      success: false,
      message: "Invalid query parameters",
      statusCode: 400,
    });
  }
});

levelRouter.put(
  "/upload",
  authtokenMiddleware,
  async (req: Request, res: Response) => {
    try {
      const jwt = jwtDecode(req.headers.authorization || "");

      if (!("id" in jwt)) {
        sendApiResponse<ErrorResponse>(res, 400, {
          success: false,
          message: "Invalid token",
          statusCode: 400,
        });
        return;
      }

      const data: unknown = req.body;
      const validatedData: OnlineData = onlineDataSchema.parse(data);

      const { uuid, ...scenarioData } = validatedData;

      OnlineMaps.upsert({
        id: validatedData.uuid,
        map_data: JSON.stringify(scenarioData),
        created_at: new Date(),
        updated_at: new Date(),
        creator_id: jwt["id"] as number,
        difficulty: validatedData.options.difficulty,
      }).then(() => {
        sendApiResponse<SuccessResponse>(res, 201, {
          success: true,
          message: "Level uploaded",
          statusCode: 201,
        });

        OnlineMapCompletions.destroy({
          where: {
            mapId: validatedData.uuid,
          },
        });
      });
    } catch (error) {
      sendApiResponse<ErrorResponse>(res, 500, {
        success: false,
        message: "Internal server error",
        statusCode: 500,
      });
    }
  }
);

export default levelRouter;
