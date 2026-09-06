const { verifyAccessToken } = require("../utils/jwt");
const { ApiError } = require("../utils/ApiError");

// Populates req.user from the JWT only — it does not look the user up in the
// database, so it can't tell "token is well-formed but the user was deleted" apart
// from "token is genuinely invalid." Routes that need to know a target still exists
// (e.g. reactions) check that themselves in the service layer.
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
    // Covers both an invalid signature and an expired token — both are just "not
    // authenticated" from the client's perspective, so they collapse to one 401.
    return next(new ApiError(401, "Unauthorized"));
  }
}

module.exports = { requireAuth };
