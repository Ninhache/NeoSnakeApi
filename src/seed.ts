import { Roles } from "./db/init";

const roles = [
  { id: 1, label: "Admin" },
  { id: 2, label: "User" },
];

export const seedRoles = async function () {
  try {
    console.log("Seeding roles");
    await Roles.bulkCreate(roles, {
      ignoreDuplicates: true,
    });
    console.log("Roles seeded successfully");
  } catch (error) {
    console.error("Failed to seed roles:", error);
  }
};
