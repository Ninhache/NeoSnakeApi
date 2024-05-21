import { Model } from "sequelize";

interface CampaignMapCompletionAttributes {
  userId: number;
  mapId: string;
  completionTime: Date;
  completionDate: Date;
}

export class CampaignMapCompletion extends Model<CampaignMapCompletionAttributes> {
  public userId!: number;
  public mapId!: string;
  public completionTime!: Date;
  public completionDate!: Date;
}

export class OnlineMapCompletion extends Model {
  public userId!: number;
  public mapId!: string;
  public completionTime!: Date;
  public completionDate!: Date;
}
