import type { ErrorCode } from '../constants/index';

export interface ApiError {
  code: ErrorCode;
  message: string;
  details?: Array<{ field: string; message: string }>;
}

export interface ApiErrorResponse {
  error: ApiError;
}

export interface PaginatedResponse<T> {
  items: T[];
  nextCursor: string | null;
  totalCount: number;
}
