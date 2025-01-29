const http = require("node:http");

const customers = [
  {
    id: 1,
    firstName: "Emin",
    lastName: "Başbayan",
  },
];

const server = http.createServer((request, response) => {
  if (request.url === "/") {
    response.writeHead(200, { "Content-Type": "text/plain" });
    response.end("Home Page");
  } else if (request.url === "/products-page") {
    response.writeHead(200, { "Content-Type": "text/plain" });
    response.end("Products Page");
  } else if (request.url === "/api/customers") {
    response.writeHead(200, { "Content-Type": "application/json" });
    response.end(JSON.stringify(customers));
  } else {
    response.writeHead(404);
    response.end("Page not found!");
  }
});

server.listen(3000, () => {
  console.log("Sunucu 3000 portunda çalışıyor!");
});
