const { Router } = require("express");
const usersController = require("../controllers/users.controller");
const { requireAuth } = require("../middlewares/auth");
const { asyncHandler } = require("../middlewares/asyncHandler");

const router = Router();

/**
 * @swagger
 * /users/me:
 *   get:
 *     summary: Get the authenticated user's full profile
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Own profile
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/SuccessEnvelope' }
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorEnvelope' }
 *   patch:
 *     summary: Update the authenticated user's name/bio
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               bio: { type: string }
 *     responses:
 *       200:
 *         description: Profile updated
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/SuccessEnvelope' }
 */
router.get("/me", requireAuth, asyncHandler(usersController.getMe));
router.patch("/me", requireAuth, asyncHandler(usersController.updateMe));

/**
 * @swagger
 * /users/me/skills:
 *   put:
 *     summary: Replace the authenticated user's full skills list
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [skills]
 *             properties:
 *               skills:
 *                 type: array
 *                 items: { type: string }
 *     responses:
 *       200:
 *         description: Skills updated
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/SuccessEnvelope' }
 */
router.put("/me/skills", requireAuth, asyncHandler(usersController.setSkills));

/**
 * @swagger
 * /users/me/experiences:
 *   post:
 *     summary: Add an experience entry to the authenticated user's profile
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, company, from]
 *             properties:
 *               title: { type: string }
 *               company: { type: string }
 *               from: { type: string, format: date }
 *               to: { type: string, format: date }
 *               description: { type: string }
 *     responses:
 *       201:
 *         description: Experience added
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/SuccessEnvelope' }
 */
router.post("/me/experiences", requireAuth, asyncHandler(usersController.addExperience));

/**
 * @swagger
 * /users/me/experiences/{experienceId}:
 *   patch:
 *     summary: Update an experience entry owned by the authenticated user
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: experienceId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Experience updated
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/SuccessEnvelope' }
 *       404:
 *         description: Experience not found or not owned by caller
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorEnvelope' }
 *   delete:
 *     summary: Delete an experience entry owned by the authenticated user
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: experienceId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Experience deleted
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/SuccessEnvelope' }
 *       404:
 *         description: Experience not found or not owned by caller
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorEnvelope' }
 */
router.patch("/me/experiences/:experienceId", requireAuth, asyncHandler(usersController.updateExperience));
router.delete("/me/experiences/:experienceId", requireAuth, asyncHandler(usersController.deleteExperience));

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: View a developer's public profile
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Public profile
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/SuccessEnvelope' }
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorEnvelope' }
 */
router.get("/:id", asyncHandler(usersController.getById));

module.exports = router;
