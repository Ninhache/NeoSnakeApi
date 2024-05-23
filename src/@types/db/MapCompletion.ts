import { Model } from "sequelize";

interface CampaignMapCompletionAttributes {
  user_id: number;
  map_id: number;
  completionTime: Date;
  completionDate: Date;
}

export class CampaignMapCompletion extends Model<CampaignMapCompletionAttributes> {
  public user_id!: number;
  public map_id!: number;
  public completionTime!: Date;
  public completionDate!: Date;
}

export class OnlineMapCompletion extends Model {
  public user_id!: number;
  public map_id!: string;
  public completionTime!: Date;
  public completionDate!: Date;
}
