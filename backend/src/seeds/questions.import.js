/**
 * Import questions from JSON file.
 * Usage:
 *   npm run import:questions
 *   npm run import:questions -- --file=src/seeds/data/questions.import.sample.json
 *   npm run import:questions -- --replace --file=src/seeds/data/questions.import.sample.json
 */
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { connectDb, disconnectDb } from "../config/db.js";
import { bulkImportQuestions } from "../services/bulkImportService.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const defaultFile = path.join(__dirname, "data/questions.import.sample.json");

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
  const result = await bulkImportQuestions(records, { replace: shouldReplace });
  console.log(`Imported ${result.insertedCount} questions from ${filePath}`);

  await disconnectDb();
}

run()
  .then(() => process.exit(0))
  .catch(async (error) => {
    console.error("Question import failed:", error.message || error);
    await disconnectDb();
    process.exit(1);
  });
