import app from "./app.js";
import env from "./config/env.js";
import { connectDb } from "./config/db.js";

async function bootstrap() {
  await connectDb();

  app.listen(env.port, () => {
    console.log(`Backend server running on port ${env.port}`);
  });
}

bootstrap().catch((error) => {
  console.error("Failed to start backend server", error);
  process.exit(1);
});
