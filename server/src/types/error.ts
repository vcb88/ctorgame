export interface ErrorWithStack extends Error {
  code?: string | number;
  type?: string;
  [key: string]: unknown;
}

export function toErrorWithStack(error: unknown): ErrorWithStack {
  if (error instanceof Error) {
    return {
      ...error,
      message: error.message,
      stack: error.stack,
      type: error.constructor.name,
      toString: () => error.toString()
    };
  }
  return {
    name: 'UnknownError',
    message: String(error),
    stack: new Error().stack,
    type: typeof error,
    toString: () => String(error)
  } as ErrorWithStack;
}