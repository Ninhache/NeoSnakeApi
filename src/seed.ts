import { Roles } from "./db/init";

const roles = [
  { id: 1, label: "Admin" },
  { id: 2, label: "User" },
];

export const seedRoles = async function () {
  try {
    console.log("Seeding roles");
    const count = await Roles.findAndCountAll();
    if (count.count > 0) {
      console.log("Roles already seeded");
      return;
    }

    const rolesUpdate = await Roles.bulkCreate(roles, {
      ignoreDuplicates: true,
    });

    console.log(rolesUpdate);
    if (rolesUpdate?.length > 0) {
      console.log("Roles seeded successfully");
    } else {
      console.log("Roles already seeded");
    }
  } catch (error) {
    console.error("Failed to seed roles:", error);
  }
};
