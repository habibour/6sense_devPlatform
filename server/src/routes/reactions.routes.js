const { Router } = require("express");
const reactionsController = require("../controllers/reactions.controller");
const { requireAuth } = require("../middlewares/auth");
const { asyncHandler } = require("../middlewares/asyncHandler");

const router = Router();

/**
 * @swagger
 * /reactions:
 *   post:
 *     summary: Like or dislike a post or comment (upsert)
 *     tags: [Reactions]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [targetType, targetId, type]
 *             properties:
 *               targetType: { type: string, enum: [POST, COMMENT] }
 *               targetId: { type: string }
 *               type: { type: string, enum: [LIKE, DISLIKE] }
 *     responses:
 *       200:
 *         description: Reaction saved
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/SuccessEnvelope' }
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorEnvelope' }
 *       404:
 *         description: Target not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorEnvelope' }
 */
router.post("/", requireAuth, asyncHandler(reactionsController.create));

/**
 * @swagger
 * /reactions/{targetType}/{targetId}:
 *   delete:
 *     summary: Remove the caller's own reaction to a target
 *     tags: [Reactions]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: targetType
 *         required: true
 *         schema: { type: string, enum: [POST, COMMENT] }
 *       - in: path
 *         name: targetId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Reaction removed
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/SuccessEnvelope' }
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorEnvelope' }
 *       404:
 *         description: Target or reaction not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorEnvelope' }
 */
router.delete("/:targetType/:targetId", requireAuth, asyncHandler(reactionsController.remove));

module.exports = router;
