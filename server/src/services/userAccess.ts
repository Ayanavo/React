import jwt, { Secret } from "jsonwebtoken";
import User from "../models/userModel.js";

export const getUserDataByToken = async (token: string) => {
  try {
    const decoded = jwt.verify(token, process.env.API_SECRET_KEY as Secret) as { id: string };
    const userId = decoded.id;
    const user = await User.findById(userId).select("-password -__v").lean();
    return user;
  } catch (error) {
    return null;
  }
};

export const getUserDataByRefreshToken = async (token: string) => {
  try {
    const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET as Secret) as { id: string };
    const userId = decoded.id;
    const user = await User.findById(userId).select("-password -__v").lean();
    return user;
  } catch (error) {
    return null;
  }
};

export const getUserIdFromRefreshToken = (token: string): string | null => {
  const decoded = jwt.decode(token) as { id?: string } | null;
  return decoded?.id ?? null;
};
