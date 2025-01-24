const http = require("node:http");
const fs = require("node:fs");

const insructor = {
  firstName: "Emin",
  lastName: "Başbayan",
};

const name = "Emin";

const server = http.createServer((request, response) => {
  response.writeHead(200, { "Content-Type": "text/html" });
  let html = fs.readFileSync("./index.html", "utf-8");
  html = html.replace("{{name}}", name)
  response.end(html);
});

server.listen(3000, () => {
  console.log("Sunucu 3000 portunda çalışıyor!");
});
