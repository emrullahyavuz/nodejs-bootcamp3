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

app.get("/", (req, res) => {
  res.status(200).sendFile(path.join(__dirname, "views", "index.html"));
});

app.get("/new-page", (req, res) => {
  res.status(200).sendFile(path.join(__dirname, "views", "new-page.html"));
});

app.get("/old-page", (req, res) => {
  res.redirect(301, "/new-page");
});

app.get("/products-page", (req, res) => {
  res.status(200).sendFile(path.join(__dirname, "views", "products.html"));
});

app.get("/api/customers", (req, res) => {
  res.status(200).json(customers);
});

app.use((req, res) => {
  res.status(404).send("Page not found!");
});

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda çalışıyor!`);
});
