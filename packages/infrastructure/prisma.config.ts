import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import { defineConfig } from "prisma/config";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: path.join(__dirname, "..", "..", ".env.local") });

const databaseUrl = process.env.DATABASE_URL;

export default defineConfig({
	schema: path.join(__dirname, "src", "prisma", "schema"),
	...(databaseUrl && {
		datasource: {
			url: databaseUrl,
		},
	}),
});
