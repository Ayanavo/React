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
