import { Model, Optional } from "sequelize";

interface RoleAttributes {
  id: number;
  label: string;
}

interface RoleCreationAttributes extends Optional<RoleAttributes, "id"> {}

export class Role
  extends Model<RoleAttributes, RoleCreationAttributes>
  implements RoleAttributes
{
  public id!: number;
  public label!: string;
}
