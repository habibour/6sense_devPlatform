const { z } = require("zod");

const createCommentSchema = z.object({
  body: z.string().min(1, "Comment body is required"),
  parentCommentId: z.string().uuid().optional(),
});

module.exports = { createCommentSchema };
