import express, { type Request, type Response, type NextFunction } from "express";
import * as swaggerUi from "swagger-ui-express";
import swaggerFile from "../dist/swagger-output.json" with { type: "json" };
import moviesRouter from "./features/movies/representational.ts";

const app = express();
const port = process.env.PORT || 3000;
const allowedOrigin = process.env.CORS_ORIGIN || "*";

app.use(express.json());

app.use((req: Request, res: Response, next: NextFunction) => {
  res.header("Access-Control-Allow-Origin", allowedOrigin);
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    res.sendStatus(204);
    return;
  }
  next();
});

app.get("/", (_, res) => {
  res.send("Hello World!");
});
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerFile));
app.use("/api/movies", moviesRouter);

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});