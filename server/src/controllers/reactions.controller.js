const reactionsService = require("../services/reactions.service");
const { createReactionSchema, removeReactionParamsSchema } = require("../validators/reaction.validator");
const { sendSuccess } = require("../utils/apiResponse");

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

module.exports = { create, remove };
