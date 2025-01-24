const http = require("node:http");

const insructor = {
  firstName: "Emin",
  lastName: "Başbayan",
};

const server = http.createServer((request, response) => {
  response.writeHead(200, { "Content-Type": "application/json" });
  response.end(JSON.stringify(insructor));
});

server.listen(3000, () => {
  console.log("Sunucu 3000 portunda çalışıyor!");
});
