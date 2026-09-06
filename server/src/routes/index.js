const { Router } = require("express");
const authRoutes = require("./auth.routes");
const usersRoutes = require("./users.routes");
const postsRoutes = require("./posts.routes");
const reactionsRoutes = require("./reactions.routes");

// One router per resource, mounted here under /api (see app.js) — comments routes
// aren't mounted directly; they're nested under posts.routes.js at /posts/:id/comments.
const router = Router();

router.use("/auth", authRoutes);
router.use("/users", usersRoutes);
router.use("/posts", postsRoutes);
router.use("/reactions", reactionsRoutes);

module.exports = router;
