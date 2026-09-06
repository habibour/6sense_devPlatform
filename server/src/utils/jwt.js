const jwt = require("jsonwebtoken");
const { env } = require("../config/env");

// `sub` (the user id) goes in the reserved JWT "subject" claim rather than a custom
// field, so requireAuth can read it back via the standard `decoded.sub` — no need to
// invent an app-specific claim name for something JWT already has a slot for.
function signAccessToken({ sub, email }) {
  return jwt.sign({ email }, env.JWT_SECRET, {
    subject: sub,
    expiresIn: env.JWT_EXPIRES_IN,
  });
}

function verifyAccessToken(token) {
  return jwt.verify(token, env.JWT_SECRET);
}

module.exports = { signAccessToken, verifyAccessToken };
