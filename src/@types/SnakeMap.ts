import { z } from "zod";

const coordinatesSchema = z.object({
  x: z.number(),
  y: z.number(),
});
export type Coordinates = z.infer<typeof coordinatesSchema>;

const directionType = ["Up", "Down", "Left", "Right"] as const;

const directionSchema = z
  .enum(directionType)
  .refine((dir) => directionType.includes(dir), {
    message: "Invalid direction",
  });
export type DirectionType = z.infer<typeof directionSchema>;

const foodType = ["FBa", "FBi", "FDe"] as const;
const FoodSchema = z.enum(foodType).refine((food) => foodType.includes(food), {
  message: "Invalid food type",
});
export type FoodType = z.infer<typeof FoodSchema>;

const obstacleColor = [
  "black",
  "gray",
  "silver",
  "blue",
  "teal",
  "cyan",
  "skyblue",
  "indigo",
  "purple",
  "violet",
  "fuchsia",
  "pink",
  "yellow",
  "orange",
  "gold",
  "lime",
  "green",
] as const;
const ObstacleColorSchema = z
  .enum(obstacleColor)
  .refine((obstacle) => obstacleColor.includes(obstacle), {
    message: "Invalid obstacle color",
  });
export type ObstacleColor = z.infer<typeof ObstacleColorSchema>;

const gameObjectTypeSchema = z.union([FoodSchema, ObstacleColorSchema]);
export type GameObjectType = z.infer<typeof gameObjectTypeSchema>;

export const scenarioFruitsSchema = z.object({
  actualPosition: coordinatesSchema,
  futurePosition: z.array(coordinatesSchema),
  type: FoodSchema,
});

export const scenarioObstaclesSchema = z.object({
  x: z.number(),
  y: z.number(),
  color: ObstacleColorSchema,
});

export const scenarioMapDataSchema = z.object({
  fruits: z.array(scenarioFruitsSchema),
  obstacles: z.array(scenarioObstaclesSchema),
});

export const scenarioDataOptionsSchema = z.object({
  width: z.literal(800),
  height: z.literal(800),
  cellSize: z.number(),
  name: z.string(),
  difficulty: z.number().min(1).max(5),
});

export const scenarioDataSchema = z.object({
  options: scenarioDataOptionsSchema,
  snake: z.object({
    startPosition: coordinatesSchema,
    direction: directionSchema,
    length: z.number().min(1).max(999),
  }),
  maps: z.array(scenarioMapDataSchema),
  uuid: z.string(),
});

export type ScenarioData = z.infer<typeof scenarioDataSchema>;
export type ScenarioFruits = z.infer<typeof scenarioFruitsSchema>;
export type ScenarioObstacles = z.infer<typeof scenarioObstaclesSchema>;
export type ScenarioOptions = z.infer<typeof scenarioDataOptionsSchema>;
