import { Roles } from "./db/init";
import { CampaignMap } from "./@types/db/CampaignMap";
import * as fs from "fs";
import * as roles from "../seeders/roles.json";

export const seedRoles = async function () {
  try {
    console.log("Seeding roles");
    const count = await Roles.findAndCountAll();
    if (count.count > 0) {
      console.log("Roles already seeded");
      return;
    }

    const roles = JSON.parse(fs.readFileSync("./seeders/roles.json", "utf8"));
    const rolesUpdate = await Roles.bulkCreate(roles, {
      ignoreDuplicates: true,
    });

    if (rolesUpdate?.length > 0) {
      console.log("Roles seeded successfully");
    } else {
      console.log("Roles already seeded");
    }
  } catch (error) {
    console.error("Failed to seed roles:", error);
  }
};

export const getAllCampaign = async function () {
  try {
    console.log("Seeding campaigns");
    const count = await CampaignMap.findAndCountAll();
    if (count.count > 0) {
      console.log("campaigns already seeded");
      return;
    }

    const campaigns = fs.readdirSync("./seeders/campaigns");
    campaigns.forEach(async (campaign, index) => {
      const campaignData = fs.readFileSync(`./seeders/campaigns/${campaign}`);
      const parsedCampaign = JSON.parse(campaignData.toString());
      await CampaignMap.create({
        id: index + 1,
        map_data: parsedCampaign,
      });
    });
  } catch (error) {
    console.error("Failed to seed roles:", error);
  }
};
