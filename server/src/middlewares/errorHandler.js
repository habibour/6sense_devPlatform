const { ApiError } = require("../utils/ApiError");

// Centralizes the error->response envelope mapping so no controller hand-writes the
// `{ success: false, ... }` shape itself. Express identifies this as error-handling
// middleware purely by its four-argument signature, so `_next` must stay even though
// it's unused.
function errorHandler(err, _req, res, _next) {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      statusCode: err.statusCode,
      message: err.message,
      ...(err.errors ? { errors: err.errors } : {}),
    });
  }

  // Zod throws its own error type on validator.parse() — this is not an ApiError,
  // so it needs a distinct branch to become the same envelope shape with field-level
  // messages a client can map onto form inputs.
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
