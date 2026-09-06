const { Router } = require("express");
const commentsController = require("../controllers/comments.controller");
const { requireAuth } = require("../middlewares/auth");
const { asyncHandler } = require("../middlewares/asyncHandler");

const router = Router({ mergeParams: true });

/**
 * @swagger
 * /posts/{id}/comments:
 *   post:
 *     summary: Create a comment or reply on a post
 *     tags: [Comments]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [body]
 *             properties:
 *               body: { type: string }
 *               parentCommentId: { type: string, format: uuid }
 *     responses:
 *       201:
 *         description: Comment created
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/SuccessEnvelope' }
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorEnvelope' }
 *       404:
 *         description: Post or parent comment not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorEnvelope' }
 *   get:
 *     summary: List all comments for a post
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Flat list of comments (client builds the nested tree)
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/SuccessEnvelope' }
 *       404:
 *         description: Post not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorEnvelope' }
 */
router.post("/", requireAuth, asyncHandler(commentsController.create));
router.get("/", asyncHandler(commentsController.list));

module.exports = router;
