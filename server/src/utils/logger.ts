export const logger = (message: string): void => {
  console.log(`[LOG] ${new Date().toLocaleDateString("en-US")} - ${JSON.parse(message)}`);
};
