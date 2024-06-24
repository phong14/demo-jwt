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

export interface AuthRequest extends Request {
  user?: JwtPayload;
}

export interface IUser extends IPayloadLogin {
  id: string;
}

export interface IDataBase {
  users: IUser[];
}
