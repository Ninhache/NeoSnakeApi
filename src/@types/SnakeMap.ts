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

export const snakeMapDataSchema = z.object({
  id: z.string(),
  options: z.object({
    width: z.literal(800),
    height: z.literal(800),
    cellSize: z.number(),
    name: z.string(),
  }),
  snake: z.object({
    startPosition: coordinatesSchema,
    direction: directionSchema,
    length: z.union([z.literal(3), z.number().max(100)]),
  }),
  gameObject: z.array(
    z.object({
      x: z.number(),
      y: z.number(),
      type: gameObjectTypeSchema,
    })
  ),
});

export type SnakeMapData = z.infer<typeof snakeMapDataSchema>;

export interface UserMetadata {
  date: Date;
  uuid: string;
}

/**
 * Defining a map that has been uploaded by a user
 */
export type UserSnakeMapData = SnakeMapData & UserMetadata;
