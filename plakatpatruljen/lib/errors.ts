export type ErrorCode =
  | 'UNKNOWN'
  | 'NETWORK'
  | 'TIMEOUT'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'VALIDATION'
  | 'CONFLICT'
  | 'SERVER_ERROR'
  | 'SUPABASE_ERROR';

export class AppError extends Error {
  constructor(
    public code: ErrorCode,
    message: string,
    public statusCode?: number,
    public details?: unknown,
  ) {
    super(message);
    this.name = 'AppError';
  }

  static fromSupabaseError(error: { message: string; code?: string; status?: number }): AppError {
    const statusCode = error.status ?? 500;
    if (statusCode === 401) return new AppError('UNAUTHORIZED', error.message, statusCode);
    if (statusCode === 403) return new AppError('FORBIDDEN', error.message, statusCode);
    if (statusCode === 404) return new AppError('NOT_FOUND', error.message, statusCode);
    if (statusCode === 409) return new AppError('CONFLICT', error.message, statusCode);
    if (statusCode === 422) return new AppError('VALIDATION', error.message, statusCode);
    return new AppError('SUPABASE_ERROR', error.message, statusCode, error.code);
  }

  static network(message = 'Network error'): AppError {
    return new AppError('NETWORK', message);
  }

  static unknown(error: unknown): AppError {
    if (error instanceof AppError) return error;
    if (error instanceof Error) return new AppError('UNKNOWN', error.message);
    return new AppError('UNKNOWN', 'An unknown error occurred');
  }
}

export type Result<T> =
  | { success: true; data: T }
  | { success: false; error: AppError };

export function ok<T>(data: T): Result<T> {
  return { success: true, data };
}

export function err<T>(error: AppError): Result<T> {
  return { success: false, error };
}
