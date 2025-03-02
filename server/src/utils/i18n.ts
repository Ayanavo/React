import i18n from "i18n";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

i18n.configure({
  locales: ["en", "bn"], // Supported languages: English and Bengali
  directory: path.join(__dirname, "../locales"), // Path to translation files
  defaultLocale: "en", // Default language
  autoReload: true, // Automatically reload translations when they change
  syncFiles: true, // Automatically add missing keys to all files
  objectNotation: true, // Allow nested JSON keys
  cookie: "lang", // Use cookies to store the language preference
});

// Export i18n for use in other files
export default i18n;
