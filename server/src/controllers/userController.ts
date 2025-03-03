import { Request, Response } from "express";
import User from "../models/userModel.js"; // Note the .js extension
import { body, validationResult } from "express-validator";

//Sign Up
export const signUp = async (req: Request, res: Response) => {
  // Validate input
  await body("email").isEmail().run(req);
  await body("password").isLength({ min: 6 }).run(req);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { firstName, lastName, title, email, password } = req.body;
    const newUser = await User.create({ firstName, lastName, title, email, password });
    await newUser.save();
    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to create user" });
  }
};

export const login = async (req: Request, res: Response) => {
  // Validate input
  await body("email").isEmail().run(req);
  await body("password").isLength({ min: 6 }).run(req);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    const jwt = await user.generateJwt();
    res.json({ token: jwt });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "An error occurred during login" });
  }
};

// Logout
export const logout = async (req: Request, res: Response) => {
  try {
    res.clearCookie("jwt");
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to logout" });
  }
};
