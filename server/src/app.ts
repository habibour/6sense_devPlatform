import cors from "cors";
import express from "express";
import { env } from "./config/env";
import { errorHandler } from "./middlewares/errorHandler";
import { notFoundHandler } from "./middlewares/notFoundHandler";
import { sendSuccess } from "./utils/apiResponse";

export function createApp() {
  const app = express();

  app.use(cors({ origin: env.CORS_ORIGIN }));
  app.use(express.json());

  app.get("/health", (_req, res) => {
    sendSuccess(res, { status: "ok" });
  });

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
