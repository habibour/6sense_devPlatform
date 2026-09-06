const { verifyAccessToken } = require("../utils/jwt");
const { ApiError } = require("../utils/ApiError");

function requireAuth(req, _res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return next(new ApiError(401, "Unauthorized"));
  }

  const token = header.slice("Bearer ".length);

  try {
    const decoded = verifyAccessToken(token);
    req.user = { id: decoded.sub, email: decoded.email };
    return next();
  } catch {
    return next(new ApiError(401, "Unauthorized"));
  }
}

module.exports = { requireAuth };
