export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public isOperational: boolean = true
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const handleError = (error: unknown): string => {
  if (error instanceof AppError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred. Please try again.';
};

export const logError = (error: unknown, context?: string) => {
  const timestamp = new Date().toISOString();
  const errorMessage = handleError(error);

  console.error(`[${timestamp}] ${context ? `[${context}]` : ''} Error:`, errorMessage);

  if (error instanceof Error) {
    console.error('Stack:', error.stack);
  }
};
