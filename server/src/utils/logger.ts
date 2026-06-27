import moment from "moment";
import type { Request, Response, NextFunction } from "express";

export const logger = (req: Request, res: Response, next: NextFunction): void => {
  const start = moment().valueOf();

  res.on("finish", () => {
    const duration = moment().valueOf() - start;
    console.log(`[LOG] ${moment().format("L LTS")} - ${req.method} ${req.url} - Status: ${res.statusCode} - ${duration}ms`);
  });

  next();
};

export const errorLogger = (err: Error, req: Request, res: Response, next: NextFunction): void => {
  console.error(`[ERROR] ${moment().format("L LTS")} - ${req.method} ${req.url} - ${err.message}`);
  next(err); // Pass the error to the next middleware
};
