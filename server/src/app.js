const cors = require("cors");
const express = require("express");
const swaggerUi = require("swagger-ui-express");
const { env } = require("./config/env");
const { errorHandler } = require("./middlewares/errorHandler");
const { notFoundHandler } = require("./middlewares/notFoundHandler");
const { sendSuccess } = require("./utils/apiResponse");
const apiRouter = require("./routes");
const { swaggerSpec } = require("./docs/swagger");

// Factory (not a module-level singleton) so tests can build isolated app instances
// without sharing Express middleware state across test files.
function createApp() {
  const app = express();

  // CORS is locked to a single configured origin (the Vite dev server), not "*" —
  // the API is only ever consumed by this one first-party SPA.
  app.use(cors({ origin: env.CORS_ORIGIN }));
  app.use(express.json());

  app.get("/health", (_req, res) => {
    sendSuccess(res, { status: "ok" });
  });

  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.use("/api", apiRouter);

  // Order matters: notFoundHandler only runs if no route above matched, and
  // errorHandler must be registered last so Express treats it as the error middleware.
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

module.exports = { createApp };
