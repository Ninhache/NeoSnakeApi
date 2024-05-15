import { DataTypes, Sequelize } from "sequelize";
import { DefaultMap } from "../@types/DefaultMap";
import {
  DefaultMapCompletion,
  OnlineMapCompletion,
} from "../@types/MapCompletion";
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

export const DefaultMaps = DefaultMap.init(
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
  },
  {
    sequelize: instance,
    modelName: "default_snake_maps",
    timestamps: false,
  }
);

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

export const OnlineMapCompletions = OnlineMapCompletion.init(
  {
    userId: {
      type: DataTypes.INTEGER,
      references: {
        model: Users,
        key: "id",
      },
    },
    mapId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: OnlineMap,
        key: "id",
      },
    },
    completionTime: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    completionDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize: instance,
    modelName: "online_map_completions",
    timestamps: false,
  }
);

export const DefaultMapCompletions = DefaultMapCompletion.init(
  {
    userId: {
      type: DataTypes.INTEGER,
      references: {
        model: Users,
        key: "id",
      },
    },
    mapId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: DefaultMap,
        key: "id",
      },
    },
    completionTime: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    completionDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize: instance,
    modelName: "default_map_completions",
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ["userId", "mapId"],
      },
    ],
  }
);

instance.sync();

/* Relationships */

Users.hasMany(OnlineMaps, { foreignKey: "creator_id" });
Users.hasMany(OnlineMapCompletion, { foreignKey: "userId" });
Users.hasMany(DefaultMapCompletion, { foreignKey: "userId" });

OnlineMaps.belongsTo(Users, { foreignKey: "creator_id", as: "creator" });
OnlineMaps.hasMany(OnlineMapCompletion, { foreignKey: "mapId" });

OnlineMapCompletions.belongsTo(Users, { foreignKey: "userId" });
OnlineMapCompletions.belongsTo(OnlineMaps, { foreignKey: "mapId" });

DefaultMaps.hasMany(DefaultMapCompletion, {
  foreignKey: "mapId",
  as: "completions",
});

DefaultMapCompletions.belongsTo(Users, { foreignKey: "userId" });
DefaultMapCompletions.belongsTo(DefaultMaps, { foreignKey: "mapId" });

instance.authenticate().then(() => {
  console.log("Connection has been established successfully.");
});
