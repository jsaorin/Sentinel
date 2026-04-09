import { config as configDotenv } from "dotenv";
import "reflect-metadata";
import App from "./app.js";

configDotenv();

const app = new App();

app.start();

process.on("SIGTERM", () => app.shutdown());
process.on("SIGINT", () => app.shutdown());
