import jwt, { JwtPayload } from "jsonwebtoken";
import { ENV } from "./environments";
import { IPayloadLogin, IResponseData, IUser, AuthRequest } from "./types";
import { NextFunction, Response } from "express";
import { StatusEnum } from "./enums";
import _uniqueId from "lodash/uniqueId";
import { GoodDB, JSONDriver } from "good.db";
import _get from "lodash/get";

const db = new GoodDB(new JSONDriver({ path: "./db.json" }));
const TABLE_USERS = "users";

const { SECRET_KEY, PORT } = ENV;

export function generateAccessToken(payload: IPayloadLogin) {
  return jwt.sign(payload, SECRET_KEY, {
    header: {
      alg: "HS256", // HS512 || HS256  || ES256 || PS256...
      typ: "JWT",
    },
    expiresIn: "1h", // 60, "2 days", "10h", "7d"
    issuer: `http://localhost:${PORT}`,
    audience: ["clientA", "clientB"],
    subject: "userA",
    // notBefore: 10,
    jwtid: "UNIQUE_JWT_ID",
    keyid: "KEY_ID",
  });
}

export function authenticateToken(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token)
    return res.status(StatusEnum.UN_AUTHORIZED).json(
      transformResponse({
        status: StatusEnum.UN_AUTHORIZED,
        errorMessage: "Unauthorized",
      })
    );

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err)
      return res.status(StatusEnum.FORBIDDEN).json(
        transformResponse({
          status: StatusEnum.FORBIDDEN,
          errorMessage: "Token Expired",
        })
      );
    req.user = user as JwtPayload | undefined;

    next();
  });
}

export async function getUser(username: string) {
  try {
    const data: IUser = await db.find(
      TABLE_USERS,
      (user: IUser) => user.username === username
    );
    return data;
  } catch {
    return null;
  }
}

export async function createUser(user: IPayloadLogin) {
  try {
    const id = _uniqueId("uuid");
    const getUserByUserName = await getUser(user.username);

    if (getUserByUserName) {
      return null;
    }

    const data = await db.push(TABLE_USERS, { ...user, id });
    return data;
  } catch {
    return null;
  }
}

export async function validateUser(user: IPayloadLogin) {
  try {
    const userData = await getUser(user.username);
    const emailIncorrect = !userData;

    const inValidPassword = user.password !== _get(userData, "password", "");
    if (emailIncorrect || inValidPassword) {
      return "Incorrect email or password!";
    }

    return "";
  } catch (error) {
    return "Can't validate user";
  }
}

export function transformResponse<T>({
  data = null,
  status,
  errorMessage = "",
  errorMessageCode = "",
}: IResponseData<T>) {
  return {
    status,
    data,
    errorMessage,
    errorMessageCode,
  };
}
