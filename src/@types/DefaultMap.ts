import { Model, Optional } from "sequelize";

interface DefaultMapsAttributes {
  id: number;
  map_data: string;
}

interface DefaultMapsCreationAttributes
  extends Optional<DefaultMapsAttributes, "id"> {}

export class DefaultMap
  extends Model<DefaultMapsAttributes, DefaultMapsCreationAttributes>
  implements DefaultMapsAttributes
{
  public id!: number;
  public map_data!: string;
}
