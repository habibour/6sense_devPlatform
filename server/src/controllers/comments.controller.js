const commentsService = require("../services/comments.service");
const { createCommentSchema } = require("../validators/comment.validator");
const { sendSuccess } = require("../utils/apiResponse");

// Thin by design, same as every controller in this codebase — see auth.controller.js.
// `req.params.id` here is the post id (route is nested under /posts/:id/comments).

async function create(req, res) {
  const data = createCommentSchema.parse(req.body);
  const comment = await commentsService.createComment(req.params.id, req.user.id, data);
  sendSuccess(res, comment, "Comment created", 201);
}

async function list(req, res) {
  const comments = await commentsService.listComments(req.params.id);
  sendSuccess(res, comments);
}

module.exports = { create, list };
