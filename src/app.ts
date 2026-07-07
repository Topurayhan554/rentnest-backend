import cors from "cors";
import express, { Application } from "express";
import config from "./config";

const app: Application = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: config.app_url,
    credentials: true,
  }),
);

export default app;
