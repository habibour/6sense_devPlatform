const swaggerJsdoc = require("swagger-jsdoc");
const path = require("path");

const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Dev Community API",
      version: "1.0.0",
      description: "REST API for the Dev Community platform (posts, comments/replies, reactions, ranking, developer profiles).",
    },
    servers: [{ url: "/api" }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        SuccessEnvelope: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            data: { type: "object" },
            message: { type: "string" },
          },
        },
        ErrorEnvelope: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            statusCode: { type: "integer" },
            message: { type: "string" },
            errors: { type: "array", items: { type: "object" } },
          },
        },
      },
    },
  },
  apis: [path.join(__dirname, "..", "routes", "*.routes.js")],
});

module.exports = { swaggerSpec };
