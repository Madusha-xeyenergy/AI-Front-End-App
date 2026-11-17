// Shared POST helper for browser-side services (forms in Client Components).
//
// URLs are relative (/api/...): the rewrite in next.config.ts forwards them to
// the Express server, and the browser attaches the login cookie by itself.

const postJson = async <T,>(url: string, body: unknown): Promise<T> => {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    // 422 responses carry per-field messages in `details`; show the first one.
    const fieldErrors = Object.values(data?.details ?? {}).flat() as string[];
    throw new Error(fieldErrors[0] ?? data?.error ?? "Something went wrong");
  }

  return data as T;
};

export { postJson };
