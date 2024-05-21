import { z } from "zod";
import { directionType, foodType, obstacleColor } from "../@types/Map";

export const ObstacleColorSchema = z.enum(obstacleColor).default("black");
export const FoodSchema = z.enum(foodType).default("FBa");
export const directionSchema = z
  .enum(directionType)
  .refine((dir) => directionType.includes(dir), {
    message: "Invalid direction",
  });

export const coordinatesSchema = z.object({
  x: z.number(),
  y: z.number(),
});

export const scenarioFruitsSchema = z.object({
  actualPosition: coordinatesSchema,
  futurePosition: z.array(coordinatesSchema).default([]),
  type: FoodSchema,
});

export const scenarioObstaclesSchema = z.object({
  x: z.number(),
  y: z.number(),
  color: ObstacleColorSchema,
});

export const scenarioTextSchema = z.object({
  x: z.number(),
  y: z.number(),
  content: z.string(),
});

export const onlineMapDataSchema = z.object({
  fruits: z.array(scenarioFruitsSchema),
  obstacles: z.array(scenarioObstaclesSchema),
});

export const campaignMapDataSchema = z.object({
  fruits: z.array(scenarioFruitsSchema),
  obstacles: z.array(scenarioObstaclesSchema).default([]),
  texts: z.array(scenarioTextSchema).default([]),
});

export const scenarioDataOptionsSchema = z.object({
  width: z.literal(800),
  height: z.literal(800),
  cellSize: z.number(),
  name: z.string(),
  difficulty: z.number().min(1).max(5),
});

export const onlineDataSchema = z.object({
  uuid: z.string(),
  options: scenarioDataOptionsSchema,
  snake: z.object({
    startPosition: coordinatesSchema,
    direction: directionSchema,
    length: z.number().min(1).max(999),
  }),
  maps: z.array(onlineMapDataSchema),
});

export const campaignDataSchema = z.object({
  id: z.number(),
  options: scenarioDataOptionsSchema,
  snake: z.object({
    startPosition: coordinatesSchema,
    direction: directionSchema,
    length: z.number().min(1).max(999),
  }),
  maps: z.array(campaignMapDataSchema),
});
