import jwt from "jsonwebtoken";

export const generateAccessToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "15m" });

export const generateRefreshToken = (payload) =>
  jwt.sign(payload, process.env.REFRESH_SECRET, { expiresIn: "2d" });

export const verifyRefreshToken = (token) =>
  jwt.verify(token, process.env.REFRESH_SECRET);

export const verifyAccessToken = (token) =>
  jwt.verify(token, process.env.JWT_SECRET);