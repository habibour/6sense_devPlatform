const { z } = require("zod");

const updateProfileSchema = z.object({
  name: z.string().min(1).optional(),
  bio: z.string().max(2000).optional(),
});

const setSkillsSchema = z.object({
  skills: z.array(z.string().min(1)),
});

const experienceSchema = z.object({
  title: z.string().min(1),
  company: z.string().min(1),
  from: z.coerce.date(),
  to: z.coerce.date().optional(),
  description: z.string().optional(),
});

// .partial() reuses the create schema's field rules for PATCH-style updates instead
// of retyping every field as optional by hand.
const updateExperienceSchema = experienceSchema.partial();

module.exports = {
  updateProfileSchema,
  setSkillsSchema,
  experienceSchema,
  updateExperienceSchema,
};
