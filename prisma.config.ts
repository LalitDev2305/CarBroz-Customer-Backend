import * as dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { defineConfig } from "prisma/config";

let envPath = path.resolve(process.cwd(), '.env.development');
if (!fs.existsSync(envPath)) {
  envPath = path.resolve(process.cwd(), '.env');
}
dotenv.config({ path: envPath });

export default defineConfig({
  schema: "packages/database/prisma/schema.prisma",
  migrations: {
    path: "packages/database/prisma/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});
