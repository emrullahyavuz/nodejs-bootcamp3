const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Node E-Commerce API",
      version: "1.0.0",
      description: "API documentation for Node E-Commerce project",
    },
    servers: [
      {
        url: "http://localhost:3001",
        description: "Development server",
      },
    ],
  },
  apis: ["./routes/*.js"]
};

module.exports = swaggerJsdoc(options);
