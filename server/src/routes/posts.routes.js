const { Router } = require("express");
const postsController = require("../controllers/posts.controller");
const commentsRoutes = require("./comments.routes");
const { requireAuth } = require("../middlewares/auth");
const { asyncHandler } = require("../middlewares/asyncHandler");

const router = Router();

/**
 * @swagger
 * /posts:
 *   post:
 *     summary: Create a post
 *     tags: [Posts]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, body]
 *             properties:
 *               title: { type: string }
 *               body: { type: string }
 *     responses:
 *       201:
 *         description: Post created
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/SuccessEnvelope' }
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorEnvelope' }
 *   get:
 *     summary: List posts ranked by score
 *     tags: [Posts]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: Ranked list of posts
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/SuccessEnvelope' }
 */
router.post("/", requireAuth, asyncHandler(postsController.create));
router.get("/", asyncHandler(postsController.list));

/**
 * @swagger
 * /posts/{id}:
 *   get:
 *     summary: Get a single post by id
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Post detail
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/SuccessEnvelope' }
 *       404:
 *         description: Post not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorEnvelope' }
 */
router.get("/:id", asyncHandler(postsController.getById));

router.use("/:id/comments", commentsRoutes);

module.exports = router;
