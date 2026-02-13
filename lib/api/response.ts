import { NextResponse } from 'next/server';

export type ApiErrorCode =
  | 'VALIDATION_ERROR'
  | 'INVALID_JSON'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'BUSINESS_RULE_VIOLATION'
  | 'INTERNAL_ERROR';

export interface ApiErrorDetail {
  field: string;
  message: string;
  code: string;
}

interface ApiErrorPayload {
  success: false;
  error: {
    code: ApiErrorCode;
    message: string;
    details?: ApiErrorDetail[];
    requestId: string;
  };
}

interface ApiSuccessPayload<T> {
  success: true;
  data: T;
}

function createRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export function apiSuccess<T>(data: T, status = 200): NextResponse<ApiSuccessPayload<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
    },
    { status }
  );
}

export function apiError(
  code: ApiErrorCode,
  message: string,
  status: number,
  details?: ApiErrorDetail[]
): NextResponse<ApiErrorPayload> {
  return NextResponse.json(
    {
      success: false,
      error: {
        code,
        message,
        details,
        requestId: createRequestId(),
      },
    },
    { status }
  );
}
