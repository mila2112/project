import express from "express";
import { Express } from "express";
import cors from "cors";
import * as bodyParser from "body-parser";
const jsonParser = bodyParser.json({
  limit: 1024 * 1024 * 1024,
});
const fileParser = bodyParser.urlencoded({
  extended: true,
  parameterLimit: 10000000,
  limit: 1024 * 1024 * 1024,
});
import { userRouter } from "./api/routes/users";
import { fileRouter } from "./api/routes/files";

const app: Express = express();

app.use(cors({ origin: "*" }));
app.use(fileParser);
app.use(jsonParser);

app.use("/users", userRouter);

app.use("/files", fileRouter);

app.listen(process.env.APP_PORT);
