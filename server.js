const express = require("express");
const app = express();

let users = [
  { id: 1, name: "Ahmet", age: 25, email: "ahmet@example.com" },
  { id: 2, name: "Ayşe", age: 30, email: "ayse@example.com" },
];

app.get("/", (req, res) => {
  res.json(users);
});

app.post("/", (req, res) => {
  const newUser = {
    id: 3,
    name: "Emin",
    age: 27,
    email: "emin@gmail.com",
  };
  users = [...users, newUser];
  
  res.json(users);
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda çalışıyor!`);
});
