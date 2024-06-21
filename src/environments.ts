import dotenv from "dotenv";

dotenv.config();

export const ENV = {
  SECRET_KEY: process.env.SECRET_KEY || "",
  PORT: process.env.PORT || 3001,
};
