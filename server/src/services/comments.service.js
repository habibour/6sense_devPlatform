const { prisma } = require("../database/prisma");
const { ApiError } = require("../utils/ApiError");

async function createComment(postId, authorId, { body, parentCommentId }) {
  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) {
    throw new ApiError(404, "Post not found");
  }

  if (parentCommentId) {
    const parent = await prisma.comment.findUnique({ where: { id: parentCommentId } });
    if (!parent) {
      throw new ApiError(404, "Parent comment not found");
    }
    if (parent.postId !== postId) {
      throw new ApiError(400, "Parent comment belongs to a different post");
    }
  }

  const [comment] = await prisma.$transaction([
    prisma.comment.create({
      data: { postId, authorId, body, parentCommentId: parentCommentId ?? null },
    }),
    prisma.post.update({
      where: { id: postId },
      data: { commentCount: { increment: 1 } },
    }),
  ]);

  return comment;
}

async function listComments(postId) {
  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) {
    throw new ApiError(404, "Post not found");
  }

  return prisma.comment.findMany({
    where: { postId },
    orderBy: { createdAt: "asc" },
  });
}

module.exports = { createComment, listComments };
