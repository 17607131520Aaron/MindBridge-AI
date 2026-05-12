import Cookies from "js-cookie";
import { message } from "antd";

type Primitive = string | number | boolean;

type QueryValue = Primitive | null | undefined | Array<Primitive | null | undefined>;

type QueryParams = Record<string, QueryValue>;

interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data: T;
}

interface RequestConfig extends Omit<RequestInit, "body"> {
  baseURL?: string;
  params?: QueryParams;
  /** 自定义 token cookie 名称，默认 "token" */
  tokenKey?: string;
  /** 跳过自动注入 token */
  skipAuth?: boolean;
  /** 返回完整响应体 { code, data, message }，默认 false 只返回 data */
  rawResponse?: boolean;
  /** 禁用自动错误提示 */
  silent?: boolean;
}

type RequestData = BodyInit | Record<string, unknown> | null;

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

function showError(msg: string) {
  message.error(msg);
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== "object") {
    return false;
  }

  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function buildURL(input: string, baseURL?: string, params?: QueryParams) {
  const url = baseURL ? new URL(input, baseURL) : new URL(input, "http://localhost");

  if (params) {
    for (const [key, rawValue] of Object.entries(params)) {
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
  body?: RequestData,
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

function buildBody(body: RequestData, headers: Headers) {
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

function processResponse<T>(result: unknown, rawResponse?: boolean): T {
  if (rawResponse) {
    return result as T;
  }

  const res = result as ApiResponse<T>;

  if (res && typeof res === "object" && "data" in res) {
    return res.data;
  }

  return result as T;
}

async function request<T>(url: string, config: RequestConfig = {}): Promise<T> {
  const { baseURL, params, headers, tokenKey, skipAuth, rawResponse, silent, signal, ...init } = config;
  const nextHeaders = buildHeaders(headers, undefined, { tokenKey, skipAuth });
  const response = await fetch(buildURL(url, baseURL, params), {
    ...init,
    headers: nextHeaders,
    signal,
  });

  const result = await parseResponse(response);

  if (!response.ok) {
    const errMsg = (result as ApiResponse)?.message || `请求失败 (${response.status})`;
    if (!silent) showError(errMsg);
    throw new RequestError(errMsg, {
      status: response.status,
      statusText: response.statusText,
      data: result,
    });
  }

  const res = result as ApiResponse;

  if (res && typeof res === "object" && "code" in res && res.code !== 0) {
    if (!silent) showError(res.message || "请求失败");
    throw new RequestError(res.message, {
      status: response.status,
      statusText: response.statusText,
      data: result,
    });
  }

  return processResponse<T>(result, rawResponse);
}

function requestWithData<T>(url: string, data: RequestData, config: RequestConfig = {}): Promise<T> {
  const { baseURL, params, headers, tokenKey, skipAuth, rawResponse, silent, signal, ...init } = config;
  const nextHeaders = buildHeaders(headers, data, { tokenKey, skipAuth });
  return fetch(buildURL(url, baseURL, params), {
    ...init,
    headers: nextHeaders,
    body: buildBody(data, nextHeaders),
    signal,
  }).then(async (response) => {
    const result = await parseResponse(response);

    if (!response.ok) {
      const errMsg = (result as ApiResponse)?.message || `请求失败 (${response.status})`;
      if (!silent) showError(errMsg);
      throw new RequestError(errMsg, {
        status: response.status,
        statusText: response.statusText,
        data: result,
      });
    }

    const res = result as ApiResponse;

    if (res && typeof res === "object" && "code" in res && res.code !== 0) {
      if (!silent) showError(res.message || "请求失败");
      throw new RequestError(res.message, {
        status: response.status,
        statusText: response.statusText,
        data: result,
      });
    }

    return processResponse<T>(result, rawResponse);
  });
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
  get: <T>(url: string, config?: RequestConfig) => request<T>(url, { ...config, method: "GET" }),
  post: <T>(url: string, data?: RequestData, config?: RequestConfig) => requestWithData<T>(url, data ?? null, { ...config, method: "POST" }),
  put: <T>(url: string, data?: RequestData, config?: RequestConfig) => requestWithData<T>(url, data ?? null, { ...config, method: "PUT" }),
  patch: <T>(url: string, data?: RequestData, config?: RequestConfig) => requestWithData<T>(url, data ?? null, { ...config, method: "PATCH" }),
  delete: <T>(url: string, config?: RequestConfig) => request<T>(url, { ...config, method: "DELETE" }),
};

export type { QueryParams, RequestConfig, ApiResponse };

export default http;
