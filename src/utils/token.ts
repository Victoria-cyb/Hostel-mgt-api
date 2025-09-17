import type { Request } from "express";
import jwt from "jsonwebtoken";
import { CustomError } from "./error";

interface Payload {
  [x: string]: unknown;
}

export const generateToken = (
  payload: Payload,
  secret: string,
  duration?: string,
) => {
  const options: {
    expiresIn?: `${number}${"s" | "m" | "h" | "d" | "w" | "y"}` | number;
  } = {};

  if (duration) {
    options.expiresIn =
      duration as `${number}${"s" | "m" | "h" | "d" | "w" | "y"}`;
  }

  const token = jwt.sign(payload, secret, options);
  return token;
};

export function decodeToken(token: string, secret: string) {
  try {
    const decodedValue = jwt.verify(token, secret);

    if (typeof decodedValue === "string") return { data: decodedValue };

    return decodedValue;
  } catch (error) {
    console.error("[Error]: invalid token", error);
    throw new CustomError("Invalid token");
  }
}

export const verifyToken = (token?: string) => {
  if (!token) {
    throw new CustomError("you are not authenticated"); // TODO: create bad request error
  }
  // Verify token
  const data = decodeToken(token, process.env.LOGIN_SECRET!);

  return { ...data };
};

export const getToken = (req: Request) => {
  return req.headers["authorization"]?.split(" ")[1];
};
