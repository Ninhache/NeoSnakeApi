import { Model, Optional } from "sequelize";
import { z } from "zod";
import { OnlineMapCompletion } from "./MapCompletion";

interface OnlineMapsAttributes {
  id: string;
  map_data: string;
  creator_id: number;
  created_at: Date;
  updated_at: Date;
  difficulty: number;
}

interface OnlineMapsCreationAttributes
  extends Optional<OnlineMapsAttributes, "id"> {}

export class OnlineMap
  extends Model<OnlineMapsAttributes, OnlineMapsCreationAttributes>
  implements OnlineMapsAttributes
{
  public id!: string;
  public map_data!: string;
  public creator_id!: number;
  public created_at!: Date;
  public updated_at!: Date;

  public completions?: OnlineMapCompletion[];
  public difficulty!: number;
}

export const PaginationSchema = z.object({
  page: z.preprocess((input) => {
    if (typeof input === "string") {
      return parseInt(input, 10);
    }
    return input;
  }, z.number().min(1, "Page must be at least 1").default(1)),
  limit: z.preprocess((input) => {
    if (typeof input === "string") {
      return parseInt(input, 10);
    }
    return input;
  }, z.number().min(1, "Limit must be at least 1").max(100, "Limit can be at most 100").default(10)),
});

export const OnlineMapFilterSchema = z.object({
  name: z.string().optional(),
  sortDate: z.enum(["asc", "desc"]).default("desc"),
  difficulty: z.preprocess((input) => {
    if (typeof input === "string") {
      return parseInt(input, 10);
    }
    return input;
  }, z.number().min(1, "Difficulty must be at least 1").max(5, "Difficulty can be at most 5").optional()),
});
