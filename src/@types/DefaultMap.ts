import { Model, Optional } from "sequelize";
import { DefaultMapCompletion } from "./MapCompletion";

interface DefaultMapsAttributes {
  id: string;
  map_data: string;
}

interface DefaultMapsCreationAttributes
  extends Optional<DefaultMapsAttributes, "id"> {}

export class DefaultMap
  extends Model<DefaultMapsAttributes, DefaultMapsCreationAttributes>
  implements DefaultMapsAttributes
{
  public id!: string;
  public map_data!: string;

  public completions?: DefaultMapCompletion[];
}
