const express = require("express");
const app = express();
const cors = require("cors");
const fs = require("node:fs");
const path = require("node:path");
const { logger } = require("./middleware/logEvents");
const errorHandler = require("./middleware/errorHandler");

// Tüm originlere izin veren basit yapılandırma
const corsOptions = {
  origin: function (origin, callback) {
    // İzin verilen origins listesi
    const whiteList = [
      "http://localhost:3000",
      "http://localhost:5173",
      "http://127.0.0.1:5173",
    ];

    if (whiteList.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error("CORS politikası tarafından engellendiniz."));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  maxAge: 86400, // 24 saat
};

app.use(cors(corsOptions));

// Request log middleware
app.use(logger);

// Middleware to parse JSON badies
app.use(express.json());
// content-type application/x-www-form-urlendcoded
app.use(express.urlencoded({ extended: false }));

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
  writeData(users);
  res.status(204).json(users);
});

app.post("/submit", (req, res) => {
  console.log(req.body);
  console.log(req.body.username);
  console.log(req.body.email);
  res.send("Form verileri alındı!");
});

app.get("/form", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "index.html"));
});

app.use(errorHandler);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda çalışıyor!`);
});
