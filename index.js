const http = require("node:http");

const server = http.createServer((request, response) => {
  response.writeHead(201, { "Content-Type": "text/plain" });
  response.end();
});
 
server.listen(3000, () => {
  console.log("Sunucu 3000 portunda çalışıyor!");
});
