const { z } = require("zod");

const targetTypeParam = z.enum(["POST", "COMMENT"]);

const createReactionSchema = z.object({
  targetType: targetTypeParam,
  targetId: z.string().min(1),
  type: z.enum(["LIKE", "DISLIKE"]),
});

const removeReactionParamsSchema = z.object({
  targetType: targetTypeParam,
  targetId: z.string().min(1),
});

module.exports = { createReactionSchema, removeReactionParamsSchema };
