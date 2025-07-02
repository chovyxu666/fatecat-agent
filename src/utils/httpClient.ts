
interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: any;
  headers?: Record<string, string>;
  signal?: AbortSignal;
}

interface HttpResponse<T = any> {
  data: T;
  ok: boolean;
  status: number;
  statusText: string;
}

class HttpClient {
  private baseHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  async request<T = any>(url: string, options: RequestOptions = {}): Promise<HttpResponse<T>> {
    const {
      method = 'GET',
      body,
      headers = {},
      signal
    } = options;

    const config: RequestInit = {
      method,
      headers: {
        ...this.baseHeaders,
        ...headers
      },
      signal
    };

    if (body && method !== 'GET') {
      config.body = typeof body === 'string' ? body : JSON.stringify(body);
    }

    const response = await fetch(url, config);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return {
      data: await response.json(),
      ok: response.ok,
      status: response.status,
      statusText: response.statusText
    };
  }

  async get<T = any>(url: string, options: Omit<RequestOptions, 'method' | 'body'> = {}): Promise<HttpResponse<T>> {
    return this.request<T>(url, { ...options, method: 'GET' });
  }

  async post<T = any>(url: string, body?: any, options: Omit<RequestOptions, 'method' | 'body'> = {}): Promise<HttpResponse<T>> {
    return this.request<T>(url, { ...options, method: 'POST', body });
  }

  async put<T = any>(url: string, body?: any, options: Omit<RequestOptions, 'method' | 'body'> = {}): Promise<HttpResponse<T>> {
    return this.request<T>(url, { ...options, method: 'PUT', body });
  }

  async delete<T = any>(url: string, options: Omit<RequestOptions, 'method' | 'body'> = {}): Promise<HttpResponse<T>> {
    return this.request<T>(url, { ...options, method: 'DELETE' });
  }

  // 特殊方法：用于流式响应
  async stream(url: string, body?: any, options: Omit<RequestOptions, 'method' | 'body'> = {}): Promise<Response> {
    const config: RequestInit = {
      method: 'POST',
      headers: {
        ...this.baseHeaders,
        ...options.headers
      },
      body: typeof body === 'string' ? body : JSON.stringify(body),
      signal: options.signal
    };

    const response = await fetch(url, config);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response;
  }
}

export const httpClient = new HttpClient();
