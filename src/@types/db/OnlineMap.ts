import { Model, Optional } from "sequelize";

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
