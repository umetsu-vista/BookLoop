const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787';

interface RequestOptions {
  method?: string;
  body?: unknown;
  token?: string | null;
  timezone?: string;
}

export async function apiClient<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, token, timezone = 'Asia/Tokyo' } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Timezone': timezone,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: { message: 'Unknown error' } }));
    throw new ApiError(res.status, error.error);
  }

  return res.json();
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public error: { code?: string; message: string },
  ) {
    super(error.message);
    this.name = 'ApiError';
  }
}
