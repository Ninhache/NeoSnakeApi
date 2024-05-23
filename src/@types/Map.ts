import { z } from "zod";
import {
  FoodSchema,
  ObstacleColorSchema,
  scenarioFruitsSchema as baseFruitsSchema,
  scenarioObstaclesSchema as baseObstaclesSchema,
  scenarioDataOptionsSchema as baseOptionsSchema,
  campaignDataSchema,
  coordinatesSchema,
  directionSchema,
  onlineDataSchema,
} from "../schema/map";

export const foodType = ["FBa", "FBi", "FDe"] as const;
export type FoodType = z.infer<typeof FoodSchema>;

export const obstacleColor = [
  "black",
  "gray",
  "silver",
  "dimgray",
  "blue",
  "teal",
  "cyan",
  "skyblue",
  "darkblue",
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
  "chartreuse",
  "springgreen",
] as const;
export type ObstacleColorType = z.infer<typeof ObstacleColorSchema>;

export const directionType = ["Up", "Down", "Left", "Right"] as const;
export type DirectionType = z.infer<typeof directionSchema>;

export type Coordinates = z.infer<typeof coordinatesSchema>;

export type OnlineData = z.infer<typeof onlineDataSchema>;
export type CampaignData = z.infer<typeof campaignDataSchema>;
export type BaseFruits = z.infer<typeof baseFruitsSchema>;
export type BaseObstacles = z.infer<typeof baseObstaclesSchema>;
export type BaseOptions = z.infer<typeof baseOptionsSchema>;
