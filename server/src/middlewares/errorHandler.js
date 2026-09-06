const { ApiError } = require("../utils/ApiError");

function errorHandler(err, _req, res, _next) {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      statusCode: err.statusCode,
      message: err.message,
      ...(err.errors ? { errors: err.errors } : {}),
    });
  }

  if (err && err.name === "ZodError" && Array.isArray(err.issues)) {
    return res.status(400).json({
      success: false,
      statusCode: 400,
      message: "Validation failed",
      errors: err.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      })),
    });
  }

  console.error(err);
  return res.status(500).json({
    success: false,
    statusCode: 500,
    message: "Internal server error",
  });
}

module.exports = { errorHandler };
