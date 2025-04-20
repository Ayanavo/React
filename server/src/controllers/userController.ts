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
    return res.status(400).json({
      message: "Validation failed",
      errors: errors.array(),
    });
  }

  try {
    const { email, password, rememberMe } = req.body;

    // Set a timeout for the database operation
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Database operation timed out")), 5000);
    });

    // Race between the database operation and the timeout
    const user = (await Promise.race([User.findOne({ email }), timeoutPromise])) as any;

    if (!user) {
      return res.status(401).json({
        message: "Email is not registered",
        status: "error",
      });
    }

    const isValidPassword = await Promise.race([user.matchPassword(password), timeoutPromise]);

    if (!isValidPassword) {
      return res.status(401).json({
        message: "Invalid password",
        status: "error",
      });
    }

    const jwt = await user.generateJwt();
    const refreshToken = await user.generateRefreshToken();

    // Set cookie options
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? ("none" as const) : ("lax" as const),
      maxAge: rememberMe ? 7 * 24 * 60 * 60 * 1000 : undefined, // 7 days or session
      path: "/",
    };

    res.cookie("refreshToken", refreshToken, cookieOptions);

    return res.status(200).json({
      token: jwt,
      message: "Successfully logged in",
      expiresIn: "4hrs",
      status: "success",
    });
  } catch (error) {
    console.error("Login error:", error);

    // Handle specific error types
    if (error instanceof Error && error.message === "Database operation timed out") {
      return res.status(504).json({
        message: "Login request timed out. Please try again.",
        status: "error",
      });
    }

    return res.status(500).json({
      message: "An error occurred during login. Please try again.",
      status: "error",
    });
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
