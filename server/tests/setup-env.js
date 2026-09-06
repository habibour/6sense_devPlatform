/* Populates the env vars config/env.js requires, so `npm test` works on a
 * clean checkout without a server/.env file. Tests never hit a real DB or
 * a real JWT secret - Prisma is mocked per-suite. */
process.env.PORT = process.env.PORT || "4000";
process.env.DATABASE_URL = process.env.DATABASE_URL || "postgresql://test:test@localhost:5432/test";
process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret";
process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1d";
process.env.CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:5174";
