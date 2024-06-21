import bodyParser from "body-parser";
import express, { Express, Request, Response } from "express";
import { StatusEnum } from "./enums";
import { ENV } from "./environments";
import {
  authenticateToken,
  generateAccessToken,
  transformResponse,
} from "./helpers";
import { RequestAuth } from "./types";

const app: Express = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
const port = ENV.PORT;

app.post("/login", (req: Request, res: Response) => {
  const { username, password } = req.body;

  const accessToken = generateAccessToken({
    username,
    password,
  });
  const data = { accessToken, username };

  res
    .status(StatusEnum.OK)
    .json(transformResponse({ data, status: StatusEnum.OK }));
});

app.get("/getUser", authenticateToken, (req: RequestAuth, res) => {
  res.status(StatusEnum.OK).json(req.user);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
