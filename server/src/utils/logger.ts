export const logger = (req: Request): void => {
  console.log(`[LOG] ${new Date().toLocaleDateString("en-US")} - ${req.method} ${req.url}`);
};
