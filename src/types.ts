import { Request } from "express";
import { StatusEnum } from "./enums";
import { JwtPayload } from "jsonwebtoken";

export interface IPayloadLogin {
  username: string;
  password: string;
}

export interface IResponseData<T> {
  data?: T | null;
  status: StatusEnum;
  errorMessage?: string;
  errorMessageCode?: string;
}

export interface RequestAuth extends Request {
  user?: JwtPayload | string;
}
