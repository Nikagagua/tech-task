import jwt from "jsonwebtoken";
import { User } from "./models.mjs";

const jwtSecret = process.env.JWT_SECRET;

export const createToken = (user) => {
  return jwt.sign(
    { id: user.id, username: user.username, signInCount: user.signInCount },
    jwtSecret,
    {
      expiresIn: "1d",
    },
  );
};

export const getUserFromToken = async (token) => {
  if (!token) return null;
  try {
    console.log("Token received for verification:", token);
    const decoded = jwt.verify(token, jwtSecret);
    console.log("Decoded token:", decoded);
    return await User.findByPk(decoded.id);
  } catch (err) {
    console.error("Failed to authenticate token:", err);
    return null;
  }
};
