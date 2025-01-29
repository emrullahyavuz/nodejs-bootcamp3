const express = require("express");
const app = express();
const path = require("node:path");

const customers = [
  {
    id: 1,
    firstName: "Emin",
    lastName: "Başbayan",
  },
];

const role = "user";

const user = {
  id: 1,
  name: "Emin Başbayan",
};

function isAdmin(req, res, next) {
  if (role === "admin") {
    next();
  } else {
    res.status(401).send("Kullanıcı yetkisi yok!");
  }
}

function isLogin(req, res, next) {
  if (user) {
    next();
  } else {
    res.status(401).send("Lütfen giriş yapınız!");
  }
}

app.get("/", (req, res) => {
  res.status(200).sendFile(path.join(__dirname, "views", "index.html"));
});

app.get("/new-page", (req, res) => {
  res.status(200).sendFile(path.join(__dirname, "views", "new-page.html"));
});

app.get("/old-page", (req, res) => {
  res.redirect(301, "/new-page");
});

app.get("/products-page", isAdmin, (req, res) => {
  res.status(200).sendFile(path.join(__dirname, "views", "products.html"));
});

app.get("/api/customers", (req, res) => {
  res.status(200).json(customers);
});

app.get("/admin", isLogin, isAdmin, (req, res) => {
  res.send("Kullanıcı admin sayfasına girebilir.");
});

/* app.use((req, res) => {
  res.status(404).send("Page not found!");
}); */

app.all("*", (req, res) => {
  res.status(404).sendFile(path.join(__dirname, "views", "404.html"));
});

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda çalışıyor!`);
});
