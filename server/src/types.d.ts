import "i18n";

declare global {
  namespace Express {
    interface Request {
      setLocale: (locale: string) => void;
      locale: string;
      __: (phrase: string, ...replacements: string[]) => string;
    }
  }
}

// Extend the Request type to include the user property
declare module "express" {
  interface Request {
    user?: TokenPayload;
  }
}
