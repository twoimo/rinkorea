import { env } from "./env";

interface RequestOptions extends RequestInit {
    cache?: RequestCache;
    revalidate?: number;
}

class ApiClient {
    private baseUrl: string;
    private defaultHeaders: HeadersInit;

    constructor() {
        this.baseUrl = env.VITE_API_URL;
        this.defaultHeaders = {
            "Content-Type": "application/json",
            "X-API-Key": env.VITE_API_KEY,
        };
    }

    private async request<T>(
        endpoint: string,
        options: RequestOptions = {}
    ): Promise<T> {
        const {
            cache = "default",
            revalidate,
            headers = {},
            ...restOptions
        } = options;

        const url = `${this.baseUrl}${endpoint}`;
        const requestHeaders = {
            ...this.defaultHeaders,
            ...headers,
        };

        // revalidate가 설정된 경우 Cache-Control 헤더 추가
        if (revalidate) {
            requestHeaders["Cache-Control"] = `s-maxage=${revalidate}, stale-while-revalidate`;
        }

        const response = await fetch(url, {
            ...restOptions,
            headers: requestHeaders,
            cache,
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.statusText}`);
        }

        return response.json();
    }

    // GET 요청
    async get<T>(endpoint: string, options: RequestOptions = {}) {
        return this.request<T>(endpoint, {
            ...options,
            method: "GET",
        });
    }

    // POST 요청
    async post<T>(endpoint: string, data: unknown, options: RequestOptions = {}) {
        return this.request<T>(endpoint, {
            ...options,
            method: "POST",
            body: JSON.stringify(data),
        });
    }

    // PUT 요청
    async put<T>(endpoint: string, data: unknown, options: RequestOptions = {}) {
        return this.request<T>(endpoint, {
            ...options,
            method: "PUT",
            body: JSON.stringify(data),
        });
    }

    // DELETE 요청
    async delete<T>(endpoint: string, options: RequestOptions = {}) {
        return this.request<T>(endpoint, {
            ...options,
            method: "DELETE",
        });
    }
}

export const apiClient = new ApiClient(); 