const { Router } = require("express");
const authRoutes = require("./auth.routes");
const usersRoutes = require("./users.routes");
const postsRoutes = require("./posts.routes");
const reactionsRoutes = require("./reactions.routes");

const router = Router();

router.use("/auth", authRoutes);
router.use("/users", usersRoutes);
router.use("/posts", postsRoutes);
router.use("/reactions", reactionsRoutes);

module.exports = router;
