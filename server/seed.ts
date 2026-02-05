import { db } from "./db";
import { roles, DATA_SOURCES, type DataSourcePermission } from "@shared/schema";

export async function seedDatabase() {
  console.log("Checking if seed data exists...");

  const existingRoles = await db.select().from(roles);
  
  if (existingRoles.length > 0) {
    console.log("Seed data already exists, skipping...");
    return;
  }

  console.log("Seeding database with default roles...");

  const fullAccessPermissions: DataSourcePermission[] = DATA_SOURCES.map(ds => ({
    dataSourceId: ds.id,
    hasAccess: true,
    tables: [{
      tableName: ds.tableName,
      columns: [],
      allColumns: true,
    }],
  }));

  await db.insert(roles).values({
    name: "App Admin",
    description: "Full administrative access to manage roles, users, and all data",
    isAdmin: true,
    permissions: fullAccessPermissions,
  });

  console.log("Database seeded successfully!");
  console.log("Created default admin role - use /setup to create initial admin user");
}
