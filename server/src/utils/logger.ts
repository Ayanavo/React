import type { Request, Response, NextFunction } from "express";

export const logger = (req: Request, res: Response, next: NextFunction): void => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(`[LOG] ${new Date().toLocaleString("en-US")} - ${req.method} ${req.url} - Status: ${res.statusCode} - ${duration}ms`);
  });

  next();
};

export const errorLogger = (err: Error, req: Request, res: Response, next: NextFunction): void => {
  console.error(`[ERROR] ${new Date().toLocaleString("en-US")} - ${req.method} ${req.url} - ${err.message}`);
  next(err); // Pass the error to the next middleware
};
