import { config as configDotenv } from "dotenv";
import "reflect-metadata";
import ReactorApp from "./app.js";

configDotenv();

const app = new ReactorApp();

app.start().catch((e) => {
	console.error("reactor:failed-to-start", e);
	process.exit(1);
});

process.on("SIGTERM", () => app.shutdown());
process.on("SIGINT", () => app.shutdown());
