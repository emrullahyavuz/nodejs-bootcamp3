const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.get('/', userController.getAllUsers);
router.post('/', userController.createUser);
router.put('/', userController.updateUser);
router.delete('/:userId', userController.deleteUser);

module.exports = router; 