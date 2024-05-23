import { DataTypes, Sequelize } from "sequelize";
import { CampaignMap } from "../@types/db/CampaignMap";
import {
  CampaignMapCompletion,
  OnlineMapCompletion,
} from "../@types/db/MapCompletion";
import { OnlineMap } from "../@types/db/OnlineMap";
import { Role } from "../@types/db/Role";
import { User } from "../@types/db/User";

const DB = process.env.POSTGRES_DB as string;
const USER = process.env.POSTGRES_USER as string;
const PASSWORD = process.env.POSTGRES_PASSWORD as string;

export const instance = new Sequelize(DB, USER, PASSWORD, {
  host: "localhost",
  dialect: "postgres",
  logging: false,
});

// instance.drop().then(() => {
//   console.log("All tables dropped");
// });

export const Roles = Role.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    label: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize: instance,
    modelName: "roles",
    timestamps: false,
  }
);

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
    role_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "roles",
        key: "id",
      },
    },
  },
  {
    sequelize: instance,
    modelName: "users",
    timestamps: false,
  }
);

export const CampaignMaps = CampaignMap.init(
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
    modelName: "campaign_snake_maps",
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
    difficulty: {
      type: DataTypes.INTEGER,
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
    user_id: {
      type: DataTypes.INTEGER,
      references: {
        model: Users,
        key: "id",
      },
    },
    map_id: {
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

export const CampaignMapCompletions = CampaignMapCompletion.init(
  {
    user_id: {
      type: DataTypes.INTEGER,
      references: {
        model: Users,
        key: "id",
      },
    },
    map_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: CampaignMap,
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
    modelName: "campaign_map_completions",
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ["user_id", "map_id"],
      },
    ],
  }
);

instance.sync({ alter: true });

/* Relationships */

Users.hasMany(OnlineMaps, { foreignKey: "creator_id" });
Users.hasMany(OnlineMapCompletion, { foreignKey: "user_id" });
Users.hasMany(CampaignMapCompletion, { foreignKey: "user_id" });

Users.belongsTo(Roles, { foreignKey: "role_id" });
Roles.hasMany(Users, { foreignKey: "role_id" });

OnlineMaps.belongsTo(Users, { foreignKey: "creator_id", as: "creator" });

OnlineMaps.hasMany(OnlineMapCompletion, {
  foreignKey: "map_id",
  as: "completions",
});

CampaignMaps.hasMany(CampaignMapCompletion, {
  foreignKey: "map_id",
  as: "completions",
});

CampaignMapCompletions.belongsTo(Users, { foreignKey: "user_id" });
CampaignMapCompletions.belongsTo(CampaignMaps, { foreignKey: "map_id" });
