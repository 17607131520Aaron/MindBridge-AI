import Cookies from "js-cookie";

type Primitive = string | number | boolean;

type QueryValue = Primitive | null | undefined | Array<Primitive | null | undefined>;

type QueryParams = Record<string, QueryValue>;

interface RequestConfig extends Omit<RequestInit, "body"> {
  baseURL?: string;
  query?: QueryParams;
  body?: BodyInit | Record<string, unknown> | null;
  /** 自定义 token cookie 名称，默认 "token" */
  tokenKey?: string;
  /** 跳过自动注入 token */
  skipAuth?: boolean;
}

export class RequestError extends Error {
  status: number;
  statusText: string;
  data: unknown;

  constructor(message: string, options: { status: number; statusText: string; data: unknown }) {
    super(message);
    this.name = "RequestError";
    this.status = options.status;
    this.statusText = options.statusText;
    this.data = options.data;
  }
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== "object") {
    return false;
  }

  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function buildURL(input: string, baseURL?: string, query?: QueryParams) {
  const url = baseURL ? new URL(input, baseURL) : new URL(input, "http://localhost");

  if (query) {
    for (const [key, rawValue] of Object.entries(query)) {
      if (rawValue == null) {
        continue;
      }

      const values = Array.isArray(rawValue) ? rawValue : [rawValue];

      for (const value of values) {
        if (value != null) {
          url.searchParams.append(key, String(value));
        }
      }
    }
  }

  return baseURL ? url.toString() : `${url.pathname}${url.search}${url.hash}`;
}

function buildHeaders(
  headers?: HeadersInit,
  body?: RequestConfig["body"],
  options?: { tokenKey?: string; skipAuth?: boolean },
) {
  const nextHeaders = new Headers(headers);

  if (body && isPlainObject(body) && !nextHeaders.has("Content-Type")) {
    nextHeaders.set("Content-Type", "application/json");
  }

  if (!nextHeaders.has("Accept")) {
    nextHeaders.set("Accept", "application/json");
  }

  if (!options?.skipAuth && !nextHeaders.has("Authorization")) {
    const token = Cookies.get(options?.tokenKey ?? "token");
    if (token) {
      nextHeaders.set("Authorization", `Bearer ${token}`);
    }
  }

  return nextHeaders;
}

function buildBody(body: RequestConfig["body"], headers: Headers) {
  if (body == null) {
    return undefined;
  }

  if (isPlainObject(body)) {
    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }
    return JSON.stringify(body);
  }

  return body;
}

async function parseResponse(response: Response) {
  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    return response.json();
  }

  if (contentType.startsWith("text/")) {
    return response.text();
  }

  return response.arrayBuffer();
}

async function request<T>(input: string, config: RequestConfig = {}): Promise<T> {
  const { baseURL, query, body, headers, tokenKey, skipAuth, signal, ...init } = config;
  const nextHeaders = buildHeaders(headers, body, { tokenKey, skipAuth });
  const response = await fetch(buildURL(input, baseURL, query), {
    ...init,
    headers: nextHeaders,
    body: buildBody(body, nextHeaders),
    signal,
  });

  const data = await parseResponse(response);

  if (!response.ok) {
    throw new RequestError(`Request failed with status ${response.status}`, {
      status: response.status,
      statusText: response.statusText,
      data,
    });
  }

  return data as T;
}

type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

function withMethod(method: Method) {
  return function <T>(input: string, config: Omit<RequestConfig, "method"> = {}) {
    return request<T>(input, { ...config, method });
  };
}

export function createCancelToken() {
  const controller = new AbortController();
  return {
    signal: controller.signal,
    cancel: () => controller.abort(),
  };
}

export const http = {
  request,
  get: withMethod("GET"),
  post: withMethod("POST"),
  put: withMethod("PUT"),
  patch: withMethod("PATCH"),
  delete: withMethod("DELETE"),
};

export type { QueryParams, RequestConfig };

export default http;
