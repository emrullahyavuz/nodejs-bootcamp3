const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { verifyToken } = require("../middleware/auth");

router.get("/", verifyToken, userController.getAllUsers);
router.post("/", verifyToken, userController.createUser);
router.put("/", verifyToken, userController.updateUser);
router.delete("/:userId", verifyToken, userController.deleteUser);

module.exports = router;
