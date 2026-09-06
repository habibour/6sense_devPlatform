const authService = require("../services/auth.service");
const { registerSchema, loginSchema } = require("../validators/auth.validator");
const { sendSuccess } = require("../utils/apiResponse");

// Controllers stay thin by design (CLAUDE.md): parse the request against a zod
// schema, delegate to the service, wrap the result — no business logic here, so
// there's nothing worth unit-testing at this layer (see ADR 0008).

async function register(req, res) {
  const data = registerSchema.parse(req.body);
  const result = await authService.register(data);
  sendSuccess(res, result, "Registered successfully", 201);
}

async function login(req, res) {
  const data = loginSchema.parse(req.body);
  const result = await authService.login(data);
  sendSuccess(res, result, "Logged in successfully");
}

module.exports = { register, login };
