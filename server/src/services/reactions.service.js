const { prisma } = require("../database/prisma");
const { ApiError } = require("../utils/ApiError");

function targetDelegate(targetType) {
  return targetType === "POST" ? prisma.post : prisma.comment;
}

function counterField(type) {
  return type === "LIKE" ? "likeCount" : "dislikeCount";
}

async function assertTargetExists(targetType, targetId) {
  const delegate = targetDelegate(targetType);
  const target = await delegate.findUnique({ where: { id: targetId } });
  if (!target) {
    throw new ApiError(404, `${targetType === "POST" ? "Post" : "Comment"} not found`);
  }
  return target;
}

async function upsertReaction(userId, { targetType, targetId, type }) {
  await assertTargetExists(targetType, targetId);

  const delegate = targetDelegate(targetType);
  const existing = await prisma.reaction.findUnique({
    where: { userId_targetType_targetId: { userId, targetType, targetId } },
  });

  if (!existing) {
    const [reaction] = await prisma.$transaction([
      prisma.reaction.create({ data: { userId, targetType, targetId, type } }),
      delegate.update({
        where: { id: targetId },
        data: { [counterField(type)]: { increment: 1 } },
      }),
    ]);
    return reaction;
  }

  if (existing.type === type) {
    return existing;
  }

  const [reaction] = await prisma.$transaction([
    prisma.reaction.update({ where: { id: existing.id }, data: { type } }),
    delegate.update({
      where: { id: targetId },
      data: {
        [counterField(existing.type)]: { decrement: 1 },
        [counterField(type)]: { increment: 1 },
      },
    }),
  ]);
  return reaction;
}

async function removeReaction(userId, targetType, targetId) {
  await assertTargetExists(targetType, targetId);

  const existing = await prisma.reaction.findUnique({
    where: { userId_targetType_targetId: { userId, targetType, targetId } },
  });

  if (!existing) {
    throw new ApiError(404, "Reaction not found");
  }

  const delegate = targetDelegate(targetType);
  await prisma.$transaction([
    prisma.reaction.delete({ where: { id: existing.id } }),
    delegate.update({
      where: { id: targetId },
      data: { [counterField(existing.type)]: { decrement: 1 } },
    }),
  ]);
}

module.exports = { upsertReaction, removeReaction };
