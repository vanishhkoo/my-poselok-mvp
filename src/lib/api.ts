import func2url from '../../backend/func2url.json';

type FunctionName = keyof typeof func2url;

interface ApiRequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
}

/**
 * Провайдер-агностичный клиент для вызова backend Cloud Functions.
 * URL функций резолвятся из backend/func2url.json (генерируется автоматически при деплое).
 */
export async function apiRequest<T = unknown>(
  fn: FunctionName,
  options: ApiRequestOptions = {},
): Promise<T> {
  const url = func2url[fn];
  if (!url) {
    throw new Error(`Backend function "${fn}" is not deployed yet`);
  }

  const { body, headers, ...rest } = options;

  const response = await fetch(url, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    throw new Error(`Request to "${fn}" failed with status ${response.status}`);
  }

  return response.json();
}
