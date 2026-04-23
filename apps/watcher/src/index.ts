import { config as configDotenv } from "dotenv";
import "reflect-metadata";
import WatcherApp from "./app.js";

configDotenv();

const app = new WatcherApp();

app.start().catch((e) => {
	console.error("watcher:failed-to-start", e);
	process.exit(1);
});

process.on("SIGTERM", () => app.shutdown());
process.on("SIGINT", () => app.shutdown());
