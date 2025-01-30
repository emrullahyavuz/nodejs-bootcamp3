const express = require("express");
const app = express();
const fs = require("node:fs");
const path = require("node:path");

let users = [
  { id: 1, name: "Ahmet", age: 25, email: "ahmet@example.com" },
  { id: 2, name: "Ayşe", age: 30, email: "ayse@example.com" },
];

// Middleware to parse JSON badies
app.use(express.json());

const filePath = "data.json";

const readData = () => {
  const jsonData = fs.readFileSync(filePath);
  return JSON.parse(jsonData);
};

const writeData = (users) => {
  fs.writeFileSync(filePath, JSON.stringify(users, null, 2));
};

// read
app.get("/", (req, res) => {
  const data = readData();
  res.json(data);
});

// create
app.post("/", (req, res) => {
  const newUser = req.body;
  let users = readData();
  users = [...users, newUser];
  fs.writeFileSync(filePath, JSON.stringify(users, null, 2));
  res.json(users);
});

// update
/* app.put("/:userId", (req, res) => {
  const { userId } = req.params;
  const { email } = req.body;
  console.log(email);

  const findUser = users.find((user) => user.id === Number(userId));
  if (findUser) {
    users = users.map((user) => {
      if (user.id === Number(userId)) {
        return { ...user, email };
      }
      return user;
    });
    res.json({ success: true, users });
  } else {
    res.json({ success: false, message: "Kullanıcı bulunamadı" });
  }
}); */

// update - body
app.put("/", (req, res) => {
  const { id: userId, email } = req.body;
  let users = readData();
  const findUser = users.find((user) => user.id === Number(userId));
  if (findUser) {
    users = users.map((user) => {
      if (user.id === Number(userId)) {
        return { ...user, email };
      }
      return user;
    });
    writeData(users);
    res.json({ success: true, users });
  } else {
    res.json({ success: false, message: "Kullanıcı bulunamadı" });
  }
});

// delete - params
app.delete("/:userId", (req, res) => {
  const { userId } = req.params;
  let users = readData();
  users = users.filter((user) => user.id !== Number(userId));
  writeData(users)
  res.status(204).json(users);
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda çalışıyor!`);
});
