import pg from "pg";
import { DataTypes, Sequelize } from "sequelize";
import { DefaultMap } from "../@types/DefaultMap";
import { OnlineMap } from "../@types/OnlineMap";
import { User } from "../@types/User";

const DB = process.env.POSTGRES_DB as string;
const USER = process.env.POSTGRES_USER as string;
const PASSWORD = process.env.POSTGRES_PASSWORD as string;

export const instance = new Sequelize(DB, USER, PASSWORD, {
  host: "localhost",
  dialect: "postgres",
});

// instance.drop().then(() => {
//   console.log("All tables dropped");
// });

export const Users = User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    username: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize: instance,
    modelName: "users",
    timestamps: false,
  }
);
Users.sync();

export const DefaultMaps = DefaultMap.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    map_data: {
      type: DataTypes.JSON,
      allowNull: false,
    },
  },
  {
    sequelize: instance,
    modelName: "default_snake_maps",
    timestamps: false,
  }
);
DefaultMaps.sync();

export const OnlineMaps = OnlineMap.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    map_data: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    creator_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize: instance,
    modelName: "online_snake_maps",
    timestamps: false,
  }
);
OnlineMaps.sync();

// /* Relationships */

Users.hasMany(OnlineMaps, { foreignKey: "creator_id" });
OnlineMaps.belongsTo(Users, { foreignKey: "creator_id", as: "creator" });

instance.authenticate().then(() => {
  console.log("Connection has been established successfully.");
});
