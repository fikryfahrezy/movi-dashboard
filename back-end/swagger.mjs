import fs from "fs";
import swaggerAutogen from "swagger-autogen";

const doc = {
  info: {
    title: 'AI Support "Triage & Recovery" Hub API',
    description: "Triage & Recovery System API documentation",
  },
  host: "ticketing-api.fahrezy.work",
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
