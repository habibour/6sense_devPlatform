const postsService = require("../services/posts.service");
const { createPostSchema, listPostsQuerySchema } = require("../validators/post.validator");
const { sendSuccess } = require("../utils/apiResponse");

async function create(req, res) {
  const data = createPostSchema.parse(req.body);
  const post = await postsService.createPost(req.user.id, data);
  sendSuccess(res, post, "Post created", 201);
}

async function list(req, res) {
  const query = listPostsQuerySchema.parse(req.query);
  const result = await postsService.listPosts(query);
  sendSuccess(res, result);
}

async function getById(req, res) {
  const post = await postsService.getPostById(req.params.id);
  sendSuccess(res, post);
}

module.exports = { create, list, getById };
