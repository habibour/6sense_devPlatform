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

  console.error(err);
  return res.status(500).json({
    success: false,
    statusCode: 500,
    message: "Internal server error",
  });
}

module.exports = { errorHandler };
