import { Model, Optional } from "sequelize";

interface OnlineMapsAttributes {
  id: string;
  map_data: string;
  creator_id: number;
  created_at: Date;
  updated_at: Date;
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
}
