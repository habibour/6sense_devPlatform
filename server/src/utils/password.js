const bcrypt = require("bcryptjs");

// 12 rounds is bcrypt's commonly-recommended floor for new systems in 2024+ — high
// enough to resist offline brute-forcing, low enough to not noticeably slow login.
const SALT_ROUNDS = 12;

function hashPassword(plain) {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

function comparePassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}

module.exports = { hashPassword, comparePassword };
