// Express doesn't forward a rejected promise from an async route handler to
// errorHandler on its own — an uncaught rejection just hangs the request. Wrapping
// every handler in this routes the rejection to next() instead.
function asyncHandler(handler) {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

module.exports = { asyncHandler };
