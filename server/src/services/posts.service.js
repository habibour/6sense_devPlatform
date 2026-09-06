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

// Fetches every post and ranks/paginates in JS rather than pushing the score
// computation and ORDER BY into SQL (see ADR 0005) — simpler at this project's scale,
// but means this whole function's cost grows with total post count, not page size.
async function listPosts({ page, limit }) {
  const posts = await prisma.post.findMany();

  const ranked = posts
    .map((post) => ({
      ...post,
      score: computeScore(post.likeCount, post.dislikeCount, post.commentCount),
    }))
    .sort((a, b) => {
      // Ties (equal score) break by newest first, so two equally-ranked posts don't
      // otherwise sort in undefined/insertion order.
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
