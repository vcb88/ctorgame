export type ErrorWithStack = Error & {
    stack: string;
    cause?: unknown;
};

export const isErrorWithStack = (error: unknown): error is ErrorWithStack => {
    return error instanceof Error && typeof (error as ErrorWithStack).stack === 'string';
};

export const getErrorDetails = (error: unknown): {
    message: string;
    stack?: string;
    cause?: unknown;
} => {
    if (isErrorWithStack(error)) {
        return {
            message: error.message,
            stack: error.stack,
            cause: error.cause
        };
    }
    
    if (error instanceof Error) {
        return {
            message: error.message
        };
    }
    
    if (typeof error === 'string') {
        return {
            message: error
        };
    }
    
    return {
        message: 'Unknown error',
        cause: error
    };
};