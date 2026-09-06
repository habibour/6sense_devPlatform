const { prisma } = require("../database/prisma");
const { ApiError } = require("../utils/ApiError");
const { computeScore } = require("../utils/ranking");

async function createPost(authorId, { title, body }) {
  return prisma.post.create({
    data: { authorId, title, body },
  });
}

async function getPostById(id) {
  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) {
    throw new ApiError(404, "Post not found");
  }
  return { ...post, score: computeScore(post.likeCount, post.dislikeCount, post.commentCount) };
}

async function listPosts({ page, limit }) {
  const posts = await prisma.post.findMany();

  const ranked = posts
    .map((post) => ({
      ...post,
      score: computeScore(post.likeCount, post.dislikeCount, post.commentCount),
    }))
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const start = (page - 1) * limit;
  const paged = ranked.slice(start, start + limit);

  return {
    posts: paged,
    pagination: { page, limit, total: ranked.length },
  };
}

module.exports = { createPost, getPostById, listPosts };
