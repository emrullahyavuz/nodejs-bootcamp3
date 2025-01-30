const express = require("express");
const app = express();

let users = [
  { id: 1, name: "Ahmet", age: 25, email: "ahmet@example.com" },
  { id: 2, name: "Ayşe", age: 30, email: "ayse@example.com" },
];

// Middleware to parse JSON badies
app.use(express.json());

app.get("/", (req, res) => {
  res.json(users);
});

app.post("/", (req, res) => {
  const newUser = req.body;

  users = [...users, newUser];

  res.json(users);
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda çalışıyor!`);
});
