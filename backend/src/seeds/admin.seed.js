/**
 * Creates or updates the admin user. Reads ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD from backend/.env (see .env.example).
 * Run: npm run seed:admin (from backend) or npm run seed:admin from repo root.
 */
import { connectDb, disconnectDb } from "../config/db.js";
import User from "../models/User.js";

const adminName = process.env.ADMIN_NAME || "SSC Admin";
const adminEmail = (process.env.ADMIN_EMAIL || "admin@ssc.local").toLowerCase();
const adminPassword = process.env.ADMIN_PASSWORD || "Admin@123";

async function seedAdmin() {
  await connectDb();

  const existingAdmin = await User.findOne({ email: adminEmail });

  if (!existingAdmin) {
    await User.create({
      name: adminName,
      email: adminEmail,
      password: adminPassword,
      role: "admin",
      isBlocked: false
    });
    console.log(`Created admin user: ${adminEmail}`);
    await disconnectDb();
    return;
  }

  existingAdmin.name = adminName;
  existingAdmin.role = "admin";
  existingAdmin.isBlocked = false;
  existingAdmin.password = adminPassword;
  await existingAdmin.save();

  console.log(`Updated admin user: ${adminEmail}`);
  await disconnectDb();
}

seedAdmin()
  .then(() => {
    process.exit(0);
  })
  .catch(async (error) => {
    console.error("Admin seed failed:", error);
    await disconnectDb();
    process.exit(1);
  });
