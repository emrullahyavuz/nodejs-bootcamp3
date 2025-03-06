const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { verifyAccessToken } = require("../middleware/auth");

router.get("/", verifyAccessToken, userController.getAllUsers);
router.post("/", verifyAccessToken, userController.createUser);
router.put("/", verifyAccessToken, userController.updateUser);
router.delete("/:userId", verifyAccessToken, userController.deleteUser);

module.exports = router;