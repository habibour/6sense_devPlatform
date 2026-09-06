const usersService = require("../services/users.service");
const {
  updateProfileSchema,
  setSkillsSchema,
  experienceSchema,
  updateExperienceSchema,
} = require("../validators/profile.validator");
const { sendSuccess } = require("../utils/apiResponse");

// Thin by design, same as every controller in this codebase — see auth.controller.js.

async function getMe(req, res) {
  const user = await usersService.getOwnProfile(req.user.id);
  sendSuccess(res, user);
}

async function getById(req, res) {
  const user = await usersService.getPublicProfile(req.params.id);
  sendSuccess(res, user);
}

async function updateMe(req, res) {
  const data = updateProfileSchema.parse(req.body);
  const user = await usersService.updateProfile(req.user.id, data);
  sendSuccess(res, user, "Profile updated");
}

async function setSkills(req, res) {
  const { skills } = setSkillsSchema.parse(req.body);
  const result = await usersService.setSkills(req.user.id, skills);
  sendSuccess(res, result, "Skills updated");
}

async function addExperience(req, res) {
  const data = experienceSchema.parse(req.body);
  const experience = await usersService.addExperience(req.user.id, data);
  sendSuccess(res, experience, "Experience added", 201);
}

async function updateExperience(req, res) {
  const data = updateExperienceSchema.parse(req.body);
  const experience = await usersService.updateExperience(req.user.id, req.params.experienceId, data);
  sendSuccess(res, experience, "Experience updated");
}

async function deleteExperience(req, res) {
  await usersService.deleteExperience(req.user.id, req.params.experienceId);
  sendSuccess(res, null, "Experience deleted");
}

module.exports = {
  getMe,
  getById,
  updateMe,
  setSkills,
  addExperience,
  updateExperience,
  deleteExperience,
};
