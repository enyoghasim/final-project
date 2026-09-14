import bcrypt from "bcrypt";
import { SignupInputSchema } from "@resume-ai/shared";
import { env } from "../config/env.js";
import { connectToDatabase, disconnectFromDatabase } from "../db/connection.js";
import { User } from "../models/User.js";

const BCRYPT_COST = 12;

function readArg(name: string): string | undefined {
  const prefix = `--${name}=`;
  const flag = process.argv.find((arg) => arg.startsWith(prefix));
  return flag?.slice(prefix.length);
}

async function main() {
  const email = readArg("email");
  const password = readArg("password");
  const fullName = readArg("name") ?? "Admin";

  if (!email || !password) {
    console.error("Usage: pnpm --filter @resume-ai/api seed -- --email=you@example.com --password=yourpassword [--name=\"Full Name\"]");
    process.exit(1);
  }

  const input = SignupInputSchema.parse({ fullName, email, password });

  await connectToDatabase();

  const passwordHash = await bcrypt.hash(input.password, BCRYPT_COST);
  const existing = await User.findOne({ email: input.email.toLowerCase() });

  if (existing) {
    existing.passwordHash = passwordHash;
    existing.fullName = input.fullName;
    await existing.save();
    console.log(`Updated existing user and reset password for ${input.email}.`);
  } else {
    await User.create({
      fullName: input.fullName,
      email: input.email,
      passwordHash,
    });
    console.log(`Created user ${input.email}.`);
  }

  if (env.DISABLE_SIGNUP) {
    console.log("Note: DISABLE_SIGNUP is true, so public signup remains closed — use this script to create further accounts.");
  }

  await disconnectFromDatabase();
}

main().catch((error: unknown) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
