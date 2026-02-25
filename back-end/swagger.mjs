import fs from "fs";
import swaggerAutogen from "swagger-autogen";

const doc = {
  info: {
    title: 'Movi API',
    description: 'API documentation for Movi application',
  },
  host: "movi-api.fahrezy.work",
  schemes: ["http", "https"],
  components: {
    securitySchemes: {
      apiKeyAuth: {
        type: "apiKey",
        in: "header",
        name: "x-api-key",
      },
    },
  },
};

if (!fs.existsSync("./dist")) {
  fs.mkdirSync("./dist");
}

const outputFile = "./dist/swagger-output.json";
const routes = ["./src/index.ts"];

swaggerAutogen()(outputFile, routes, doc);
