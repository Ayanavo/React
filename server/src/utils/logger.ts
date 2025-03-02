export const logger = (message: string): void => {
    console.log(`[LOG] ${new Date().toISOString()} - ${message}`);
  };