import { hash } from "bcrypt";
import { NextFunction, Request, Response } from "express";
import { body, validationResult } from "express-validator";
import jwt, { Secret, VerifyErrors } from "jsonwebtoken";
import User from "../models/userModel.js"; // Note the .js extension

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
    if (!firstName || !lastName || !title || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const saltRounds = 10;
    const hashedPassword = await hash(password, saltRounds);

    const newUser = new User({ firstName, lastName, title, email, ...{ password: hashedPassword } });
    await newUser.save();
    res.status(201).json({ message: "User created successfully", user: newUser });
  } catch (error) {
    console.error("Error creating user:", error);
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
    const { email, password, rememberMe } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Email is not registered" });
    }
    if (!(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid password" });
    }
    const jwt = await user.generateJwt();
    const refreshToken = await user.generateRefreshToken();

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      maxAge: rememberMe ? 7 * 24 * 60 * 60 * 1000 : undefined, // 7 days or session cookie
      sameSite: "lax",
      path: "/",
    });

    res.status(200).json({
      token: jwt,
      refreshToken: refreshToken,
      message: "Successfully logged in",
      expiresIn: "4hrs",
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "An error occurred during login", error: error }); // send error message
  }
};

// Logout
export const logout = async (req: Request, res: Response) => {
  try {
    res.clearCookie("authToken");
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to logout" });
  }
};

// authentication
export function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies.authToken;

  if (!token) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  jwt.verify(token, process.env.API_SECRET_KEY as Secret, (err: VerifyErrors | null, decoded: any) => {
    if (err) {
      return res.status(403).json({ message: "Invalid or expired token." });
    }
    req.user = decoded;
    next();
  });
}

// Refresh Token
export const refreshToken = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ message: "No refresh token provided" });
    }

    // Verify the refresh token
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET as Secret) as { id: string };
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    // Generate new session token
    const newToken = await user.generateJwt();

    res.status(200).json({
      token: newToken,
      message: "Token refreshed successfully",
      expiresIn: "4hrs",
    });
  } catch (error) {
    console.error("Refresh token error:", error);
    res.status(401).json({ message: "Invalid refresh token" });
  }
};
