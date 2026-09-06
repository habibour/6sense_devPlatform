const reactionsService = require("../services/reactions.service");
const { createReactionSchema, removeReactionParamsSchema } = require("../validators/reaction.validator");
const { sendSuccess } = require("../utils/apiResponse");

// Thin by design, same as every controller in this codebase — see auth.controller.js.

async function create(req, res) {
  const data = createReactionSchema.parse(req.body);
  const reaction = await reactionsService.upsertReaction(req.user.id, data);
  sendSuccess(res, reaction, "Reaction saved");
}

async function remove(req, res) {
  const { targetType, targetId } = removeReactionParamsSchema.parse(req.params);
  await reactionsService.removeReaction(req.user.id, targetType, targetId);
  sendSuccess(res, null, "Reaction removed");
}

async function getMine(req, res) {
  const { targetType, targetId } = removeReactionParamsSchema.parse(req.params);
  const reaction = await reactionsService.getMyReaction(req.user.id, targetType, targetId);
  // Explicit `{ type: null }` (200) rather than a 404 when no reaction exists — "you
  // haven't reacted yet" is an expected, common case for the client, not an error.
  sendSuccess(res, { type: reaction?.type ?? null });
}

module.exports = { create, remove, getMine };
