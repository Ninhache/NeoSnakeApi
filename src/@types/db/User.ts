import { Model, Optional } from "sequelize";

interface UserAttributes {
  id: number;
  username: string;
  password: string;
  role_id: number;
}

interface UserCreationAttributes
  extends Optional<UserAttributes, "id" | "role_id"> {}

export class User
  extends Model<UserAttributes, UserCreationAttributes>
  implements UserAttributes
{
  public id!: number;
  public username!: string;
  public password!: string;
  public role_id!: number;
}
