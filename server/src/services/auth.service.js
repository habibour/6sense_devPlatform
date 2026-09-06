const { prisma } = require("../database/prisma");
const { ApiError } = require("../utils/ApiError");
const { hashPassword, comparePassword } = require("../utils/password");
const { signAccessToken } = require("../utils/jwt");

// Destructuring off passwordHash (and discarding it via the unused `_` var) is the
// cheapest way to strip it before a user object ever reaches a response — no
// separate DTO/mapper layer for what's otherwise a pass-through object.
function toPublicUser(user) {
  const { passwordHash: _passwordHash, ...publicUser } = user;
  return publicUser;
}

async function register({ name, email, password }) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new ApiError(409, "Email is already registered");
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: { name, email, passwordHash },
  });

  const accessToken = signAccessToken({ sub: user.id, email: user.email });
  return { user: toPublicUser(user), accessToken };
}

async function login({ email, password }) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  const valid = await comparePassword(password, user.passwordHash);
  if (!valid) {
    // Same message and status as "user not found" above — never reveal to a caller
    // whether the email itself exists, which would let someone enumerate registered
    // accounts by trying logins and reading the error text.
    throw new ApiError(401, "Invalid email or password");
  }

  const accessToken = signAccessToken({ sub: user.id, email: user.email });
  return { user: toPublicUser(user), accessToken };
}

module.exports = { register, login, toPublicUser };
