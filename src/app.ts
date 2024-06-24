import bodyParser from "body-parser";
import express, { Express, Request, Response } from "express";
import { StatusEnum } from "./enums";
import { ENV } from "./environments";
import {
  authenticateToken,
  createUser,
  generateAccessToken,
  getUser,
  transformResponse,
  validateUser,
} from "./helpers";
import { AuthRequest } from "./types";
import _get from "lodash/get";

const app: Express = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
const port = ENV.PORT;

app.post("/register", async (req: Request, res: Response) => {
  const username = req.body.username.toLowerCase();
  const password = req.body.password;
  const newUser = {
    username,
    password,
  };

  const createUserData = await createUser(newUser);

  if (!createUserData) {
    return res.json(
      transformResponse({
        status: StatusEnum.OK,
        errorMessage: "User already exist!",
      })
    );
  }

  res.json(
    transformResponse({
      status: StatusEnum.OK,
    })
  );
});

app.post("/login", async (req: Request, res: Response) => {
  const { username, password } = req.body;

  const inValid = await validateUser({ username, password });

  if (inValid) {
    return res.json(
      transformResponse({
        status: StatusEnum.OK,
        errorMessage: inValid,
      })
    );
  }

  const accessToken = generateAccessToken({
    username,
    password,
  });
  const data = { accessToken };

  res.json(transformResponse({ data, status: StatusEnum.OK }));
});

app.get("/getUserInfo", authenticateToken, async (req: AuthRequest, res) => {
  const usernameReq = _get(req.user, "username", "");

  const data = await getUser(usernameReq);

  if (!data) {
    return res.json(
      transformResponse({
        errorMessage: "User does not exist!",
        status: StatusEnum.OK,
      })
    );
  }
  const { username } = data;

  res.json(transformResponse({ data: { username }, status: StatusEnum.OK }));
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
