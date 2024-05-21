import { Model, Optional } from "sequelize";
import { CampaignMapCompletion as CampaignMapCompletion } from "./MapCompletion";

interface CampaignMapsAttributes {
  id: number;
  map_data: string;
}

interface CampaignMapsCreationAttributes
  extends Optional<CampaignMapsAttributes, "id"> {}

export class CampaignMap
  extends Model<CampaignMapsAttributes, CampaignMapsCreationAttributes>
  implements CampaignMapsAttributes
{
  public id!: number;
  public map_data!: string;

  public completions?: CampaignMapCompletion[];
}
