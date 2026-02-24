import express from "express";
import * as swaggerUi from "swagger-ui-express";
import swaggerFile from "../dist/swagger-output.json" with { type: "json" };

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.get("/", (_, res) => {
  res.send("Hello World!");
});
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerFile));
app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});