const cors = require("cors");
const express = require("express");
const swaggerUi = require("swagger-ui-express");
const { env } = require("./config/env");
const { errorHandler } = require("./middlewares/errorHandler");
const { notFoundHandler } = require("./middlewares/notFoundHandler");
const { sendSuccess } = require("./utils/apiResponse");
const apiRouter = require("./routes");
const { swaggerSpec } = require("./docs/swagger");

function createApp() {
  const app = express();

  app.use(cors({ origin: env.CORS_ORIGIN }));
  app.use(express.json());

  app.get("/health", (_req, res) => {
    sendSuccess(res, { status: "ok" });
  });

  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.use("/api", apiRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

module.exports = { createApp };
