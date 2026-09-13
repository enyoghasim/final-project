import { env } from "./config/env.js";
import { createApp } from "./app.js";
import { connectToDatabase } from "./db/connection.js";

async function main() {
  await connectToDatabase();

  const app = createApp();
  app.listen(env.PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`API listening on port ${env.PORT}`);
  });
}

main().catch((error) => {
  // eslint-disable-next-line no-console
  console.error("Failed to start server:", error);
  process.exit(1);
});
