const jwt = require("jsonwebtoken");
const { env } = require("../config/env");

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
