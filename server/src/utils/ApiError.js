// Thrown from services/controllers to carry an HTTP status alongside the message;
// errorHandler.js special-cases this type to map it straight onto the error envelope,
// as opposed to a plain Error which falls through to a generic 500.
class ApiError extends Error {
  constructor(statusCode, message, errors) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

module.exports = { ApiError };
