const { PrismaClient } = require("@prisma/client");

// One PrismaClient instance for the whole process, imported everywhere data access
// happens — Prisma's own docs warn against constructing a new client per request,
// since each instance opens its own connection pool.
const prisma = new PrismaClient();

module.exports = { prisma };
