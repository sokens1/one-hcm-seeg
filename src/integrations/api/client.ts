// Lightweight fetch-based API client
// Usage example:
// import { api } from "@/integrations/api/client";
// const { data } = await api.get("/path");

export type ResponseType = "json" | "blob" | "text";

export interface ApiOptions {
  headers?: Record<string, string>;
  responseType?: ResponseType;
  signal?: AbortSignal;
}

async function handleResponse(res: Response, responseType: ResponseType = "json") {
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `${res.status} ${res.statusText}`);
  }

  switch (responseType) {
    case "blob":
      return await res.blob();
    case "text":
      return await res.text();
    case "json":
    default: {
      // Handle empty body safely
      const contentType = res.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        const txt = await res.text().catch(() => "");
        try {
          return txt ? JSON.parse(txt) : null;
        } catch {
          return txt as unknown;
        }
      }
      return await res.json().catch(() => null);
    }
  }
}

function buildHeaders(init?: HeadersInit, hasBody?: boolean, isFormData?: boolean): HeadersInit {
  const base: Record<string, string> = {
    Accept: "application/json",
  };
  if (hasBody && !isFormData) {
    base["Content-Type"] = "application/json";
  }
  return { ...base, ...(init as Record<string, string> | undefined) };
}

async function request<T = unknown>(
  method: string,
  url: string,
  body?: unknown,
  options: ApiOptions = {}
): Promise<{ data: T } & { status: number; headers: Headers }> {
  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;
  const hasBody = body !== undefined && body !== null;

  const res = await fetch(url, {
    method,
    headers: buildHeaders(options.headers, hasBody, isFormData),
    body: hasBody ? (isFormData ? (body as FormData) : JSON.stringify(body)) : undefined,
    signal: options.signal,
    // credentials: "include", // Uncomment if your API needs cookies
  });

  const data = (await handleResponse(res, options.responseType)) as T;
  return { data, status: res.status, headers: res.headers };
}

export const api = {
  get<T = unknown>(url: string, options?: ApiOptions) {
    return request<T>("GET", url, undefined, options);
  },
  delete<T = unknown>(url: string, options?: ApiOptions) {
    return request<T>("DELETE", url, undefined, options);
  },
  post<T = unknown>(url: string, body?: unknown, options?: ApiOptions) {
    return request<T>("POST", url, body, options);
  },
  put<T = unknown>(url: string, body?: unknown, options?: ApiOptions) {
    return request<T>("PUT", url, body, options);
  },
  patch<T = unknown>(url: string, body?: unknown, options?: ApiOptions) {
    return request<T>("PATCH", url, body, options);
  },
};
