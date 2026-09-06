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
    // Guards against a client passing a real but mismatched parentCommentId — e.g. a
    // stale reply form left open while navigating to a different post — which would
    // otherwise silently thread a reply onto the wrong post's comment tree.
    if (parent.postId !== postId) {
      throw new ApiError(400, "Parent comment belongs to a different post");
    }
  }

  // Comment creation and the post's denormalized commentCount must move together —
  // an untransacted pair here could leave the counter permanently out of sync with
  // reality if the process crashed between the two writes.
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
