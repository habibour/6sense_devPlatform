require("dotenv/config");

const REQUIRED_VARS = [
  "PORT",
  "DATABASE_URL",
  "JWT_SECRET",
  "JWT_EXPIRES_IN",
  "CORS_ORIGIN",
];

// Fails fast at boot rather than letting a missing var surface later as a cryptic
// runtime error (e.g. a silently-undefined JWT_SECRET signing tokens with "undefined").
function loadEnv() {
  const missing = REQUIRED_VARS.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    console.error(
      `Missing required environment variable(s): ${missing.join(", ")}. Copy server/.env.example to server/.env and fill them in.`
    );
    process.exit(1);
  }

  return Object.fromEntries(REQUIRED_VARS.map((key) => [key, process.env[key]]));
}

const env = loadEnv();

module.exports = { env };
