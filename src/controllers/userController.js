const User = require("../models/User.js");

const getAllUsers = (req, res) => {
  try {
    const users = User.findAll();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createUser = (req, res) => {
  try {
    const newUser = { id: Date.now(), ...req.body }; // Benzersiz ID oluştur
    User.create(newUser);
    res.status(201).json(newUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateUser = (req, res) => {
  try {
    const { id, email } = req.body;
    const updatedUser = User.update(id, { email });
    if (updatedUser) {
      res.json({ success: true, user: updatedUser });
    } else {
      res.status(404).json({ success: false, message: "Kullanıcı bulunamadı" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteUser = (req, res) => {
  try {
    const { userId } = req.params;
    User.delete(userId);
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
};
