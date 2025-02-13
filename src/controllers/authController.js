const path = require("path");
const fs = require("fs");

// Yeni register fonksiyonu
const registerUser = (req, res) => {
  try {
    const newUser = { id: Date.now(), ...req.body };
    const usersFilePath = path.join(__dirname, "..", "..", "users.json");
    const users = JSON.parse(fs.readFileSync(usersFilePath, "utf-8"));
    // Email kontrolü
    const existingUser = users.find((user) => user.email === newUser.email);
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Bu email adresi zaten kayıtlı." });
    }
    users.push(newUser);
    fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
    res.status(201).json(newUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Yeni login fonksiyonu
const loginUser = (req, res) => {
  try {
    const { email, password } = req.body;
    const usersFilePath = path.join(__dirname, "..", "..", "users.json");
    const users = JSON.parse(fs.readFileSync(usersFilePath, "utf-8"));
    // Kullanıcı doğrulama
    const user = users.find(
      (user) => user.email === email && user.password === password
    );
    if (!user) {
      return res.status(401).json({ message: "Geçersiz email veya şifre." });
    }
    res.status(200).json({ message: "Giriş başarılı!", user });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
};
