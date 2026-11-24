/** Browser-side fetch helper: sends JSON, includes the session cookie, and throws the API's error message. */
export async function api<T = unknown>(path: string, init: RequestInit & { json?: unknown } = {}): Promise<T> {
  const { json, headers, ...rest } = init;
  const response = await fetch(path, {
    credentials: "same-origin",
    ...rest,
    headers: json !== undefined ? { "Content-Type": "application/json", ...headers } : headers,
    body: json !== undefined ? JSON.stringify(json) : rest.body,
  });
  if (response.status === 204) return undefined as T;
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const error = new Error((data as { error?: string } | null)?.error ?? `Request failed (${response.status}).`) as Error & { status: number };
    error.status = response.status;
    throw error;
  }
  return data as T;
}

export function formatPrice(value: number) {
  return `₹${Number.isInteger(value) ? value : value.toFixed(2)}`;
}
