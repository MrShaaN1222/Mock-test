/**
 * Import exams from JSON file.
 * Usage:
 *   npm run import:exams
 *   npm run import:exams -- --file=src/seeds/data/exams.import.sample.json
 *   npm run import:exams -- --replace --file=src/seeds/data/exams.import.sample.json
 */
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { connectDb, disconnectDb } from "../config/db.js";
import User from "../models/User.js";
import { bulkImportExams } from "../services/bulkImportService.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const defaultFile = path.join(__dirname, "data/exams.import.sample.json");
const adminEmail = (process.env.ADMIN_EMAIL || "admin@ssc.local").toLowerCase();

function getArgValue(name) {
  const arg = process.argv.find((item) => item.startsWith(`${name}=`));
  return arg ? arg.split("=").slice(1).join("=") : "";
}

async function run() {
  const relativeFile = getArgValue("--file");
  const shouldReplace = process.argv.includes("--replace");
  const filePath = relativeFile ? path.resolve(process.cwd(), relativeFile) : defaultFile;

  const fileRaw = await fs.readFile(filePath, "utf8");
  const records = JSON.parse(fileRaw);

  await connectDb();

  const adminUser = await User.findOne({ email: adminEmail });
  if (!adminUser) {
    throw new Error(`Admin user not found for ${adminEmail}. Run npm run seed:admin first.`);
  }

  const result = await bulkImportExams(records, {
    replace: shouldReplace,
    createdBy: adminUser._id
  });
  console.log(`Imported ${result.insertedCount} exams from ${filePath}`);

  await disconnectDb();
}

run()
  .then(() => process.exit(0))
  .catch(async (error) => {
    console.error("Exam import failed:", error.message || error);
    await disconnectDb();
    process.exit(1);
  });
