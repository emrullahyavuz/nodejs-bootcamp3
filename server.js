const express = require("express");
const app = express();

let users = [
  { id: 1, name: "Ahmet", age: 25, email: "ahmet@example.com" },
  { id: 2, name: "Ayşe", age: 30, email: "ayse@example.com" },
];

// Middleware to parse JSON badies
app.use(express.json());

// read
app.get("/", (req, res) => {
  res.json(users);
});

// create
app.post("/", (req, res) => {
  const newUser = req.body;

  users = [...users, newUser];

  res.json(users);
});

// update
app.put("/:userId", (req, res) => {
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
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda çalışıyor!`);
});
