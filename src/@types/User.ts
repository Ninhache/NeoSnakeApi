import { Model, Optional } from "sequelize";

interface UserAttributes {
  id: number;
  username: string;
  password: string;
}

interface UserCreationAttributes extends Optional<UserAttributes, "id"> {}

export class User
  extends Model<UserAttributes, UserCreationAttributes>
  implements UserAttributes
{
  public id!: number; // using '!' to assure TypeScript that these fields will be initialized
  public username!: string;
  public password!: string;
}
