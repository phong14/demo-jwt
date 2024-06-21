import jwt from "jsonwebtoken";
import { ENV } from "./environments";
import { IPayloadLogin, IResponseData, RequestAuth } from "./types";
import { NextFunction, Request, Response } from "express";
import { StatusEnum } from "./enums";

const SECRET_KEY = ENV.SECRET_KEY;

export function generateAccessToken(payload: IPayloadLogin) {
  return jwt.sign(payload, SECRET_KEY, {
    expiresIn: "1h",
  });
}

export function authenticateToken(
  req: RequestAuth,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null)
    return res.status(StatusEnum.UN_AUTHORIZED).json(
      transformResponse({
        status: StatusEnum.UN_AUTHORIZED,
        errorMessage: "Unauthorized",
      })
    );

  jwt.verify(token, SECRET_KEY as string, (err: any, user) => {
    if (err)
      return res.status(StatusEnum.UN_AUTHORIZED).json(
        transformResponse({
          status: StatusEnum.UN_AUTHORIZED,
          errorMessage: "Token Expired",
        })
      );
    req.user = user;

    next();
  });
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
