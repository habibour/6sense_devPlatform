const { z } = require("zod");

// parentCommentId is optional and does the double duty of distinguishing a top-level
// comment (omitted) from a threaded reply (set to the comment being replied to) —
// one endpoint, one schema, no separate "reply" route.
const createCommentSchema = z.object({
  body: z.string().min(1, "Comment body is required"),
  parentCommentId: z.string().uuid().optional(),
});

module.exports = { createCommentSchema };
