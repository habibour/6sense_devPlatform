const { z } = require("zod");

// Shared between create and remove so the two endpoints can't drift on which target
// types are legal — mirrors the Prisma TargetType enum in schema.prisma.
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
