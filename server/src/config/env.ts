import "dotenv/config";

const REQUIRED_VARS = [
  "PORT",
  "DATABASE_URL",
  "JWT_SECRET",
  "JWT_EXPIRES_IN",
  "CORS_ORIGIN",
] as const;

type EnvVar = (typeof REQUIRED_VARS)[number];

function loadEnv(): Record<EnvVar, string> {
  const missing = REQUIRED_VARS.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    console.error(
      `Missing required environment variable(s): ${missing.join(", ")}. Copy server/.env.example to server/.env and fill them in.`
    );
    process.exit(1);
  }

  return Object.fromEntries(
    REQUIRED_VARS.map((key) => [key, process.env[key] as string])
  ) as Record<EnvVar, string>;
}

export const env = loadEnv();
