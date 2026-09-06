const { prisma } = require("../database/prisma");
const { ApiError } = require("../utils/ApiError");

// An explicit allow-list (rather than an exclude-list) for viewing *someone else's*
// profile, so a new field added to User later (email, passwordHash) is private by
// default instead of automatically leaking through this endpoint.
const PUBLIC_SELECT = {
  id: true,
  name: true,
  bio: true,
  createdAt: true,
  skills: true,
  experiences: true,
};

async function getPublicProfile(id) {
  const user = await prisma.user.findUnique({ where: { id }, select: PUBLIC_SELECT });
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  return user;
}

async function getOwnProfile(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { skills: true, experiences: true },
  });
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  const { passwordHash: _passwordHash, ...publicUser } = user;
  return publicUser;
}

async function updateProfile(userId, data) {
  const user = await prisma.user.update({ where: { id: userId }, data });
  const { passwordHash: _passwordHash, ...publicUser } = user;
  return publicUser;
}

// The client sends the full desired skill list, not a single add/remove — so the
// simplest correct implementation is "replace everything" (delete then recreate)
// inside one transaction, rather than diffing old vs. new server-side.
async function setSkills(userId, skills) {
  const uniqueSkills = [...new Set(skills)];

  await prisma.$transaction([
    prisma.skill.deleteMany({ where: { userId } }),
    prisma.skill.createMany({
      data: uniqueSkills.map((name) => ({ userId, name })),
    }),
  ]);

  return prisma.skill.findMany({ where: { userId } });
}

async function addExperience(userId, data) {
  return prisma.experience.create({ data: { ...data, userId } });
}

// Returns 404 (not 403) for "exists but belongs to someone else" — same response as
// "doesn't exist at all," so a caller can't use this endpoint to probe which
// experience ids exist for other users.
async function assertOwnedExperience(userId, experienceId) {
  const experience = await prisma.experience.findUnique({ where: { id: experienceId } });
  if (!experience || experience.userId !== userId) {
    throw new ApiError(404, "Experience not found");
  }
  return experience;
}

async function updateExperience(userId, experienceId, data) {
  await assertOwnedExperience(userId, experienceId);
  return prisma.experience.update({ where: { id: experienceId }, data });
}

async function deleteExperience(userId, experienceId) {
  await assertOwnedExperience(userId, experienceId);
  await prisma.experience.delete({ where: { id: experienceId } });
}

module.exports = {
  getPublicProfile,
  getOwnProfile,
  updateProfile,
  setSkills,
  addExperience,
  updateExperience,
  deleteExperience,
};
