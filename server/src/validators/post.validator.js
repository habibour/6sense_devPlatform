const { z } = require("zod");

const createPostSchema = z.object({
  title: z.string().min(1, "Title is required"),
  body: z.string().min(1, "Body is required"),
});

// z.coerce because query-string values arrive as strings ("2", not 2). `limit` is
// capped at 100 so a client can't request an unbounded page and force a full table scan.
const listPostsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

module.exports = { createPostSchema, listPostsQuerySchema };
