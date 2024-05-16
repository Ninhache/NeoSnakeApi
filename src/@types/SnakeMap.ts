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

const obstacleType = ["OBa", "ODi"] as const;
const ObstacleSchema = z
  .enum(obstacleType)
  .refine((obstacle) => obstacleType.includes(obstacle), {
    message: "Invalid obstacle type",
  });
export type ObstacleType = z.infer<typeof ObstacleSchema>;

const gameObjectTypeSchema = z.union([FoodSchema, ObstacleSchema]);
export type GameObjectType = z.infer<typeof gameObjectTypeSchema>;

export const scenarioFruitsSchema = z.object({
  actualPosition: coordinatesSchema,
  futurePosition: z.array(coordinatesSchema),
  type: FoodSchema,
});

export const scenarioMapDataSchema = z.object({
  fruits: z.array(scenarioFruitsSchema),
  obstacles: z.array(
    z.object({
      x: z.number(),
      y: z.number(),
      type: ObstacleSchema,
    })
  ),
});

export const scenarioDataSchema = z.object({
  options: z.object({
    width: z.literal(800),
    height: z.literal(800),
    cellSize: z.number(),
    name: z.string(),
    difficulty: z.number().min(1).max(5),
  }),
  snake: z.object({
    startPosition: coordinatesSchema,
    direction: directionSchema,
    length: z.union([z.literal(3), z.number().max(100)]),
  }),
  maps: z.array(scenarioMapDataSchema),
  uuid: z.string(),
});

export type ScenarioData = z.infer<typeof scenarioDataSchema>;
