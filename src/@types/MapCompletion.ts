import { Model } from "sequelize";
import { z } from "zod";

interface DefaultMapCompletionAttributes {
  userId: number;
  mapId: string;
  completionTime: Date;
  completionDate: Date;
}

export class DefaultMapCompletion extends Model<DefaultMapCompletionAttributes> {
  public userId!: number;
  public mapId!: string;
  public completionTime!: Date;
  public completionDate!: Date;
}

export const DefaultMapCompletionSchema = z.object({
  userId: z.number(),
  mapId: z.string(),
  completionTime: z.number(),
  completionDate: z.number(),
});

export class OnlineMapCompletion extends Model {
  public userId!: number;
  public mapId!: string;
  public completionTime!: Date;
  public completionDate!: Date;
}
