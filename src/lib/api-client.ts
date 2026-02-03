import axios, { AxiosInstance, AxiosRequestConfig, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { logger } from './logger';

export interface RequestConfig extends AxiosRequestConfig {
  retries?: number;
  retryDelay?: number;
  timeout?: number;
}

export interface PendingRequest {
  promise: Promise<any>;
  abortController: AbortController;
  timestamp: number;
}

class APIClient {
  private instance: AxiosInstance;
  private pendingRequests: Map<string, PendingRequest> = new Map();
  private readonly REQUEST_TIMEOUT = 30000; // 30 seconds
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY = 1000; // 1 second base delay

  constructor(baseURL: string) {
    this.instance = axios.create({
      baseURL,
      timeout: this.REQUEST_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor - Add auth token
    this.instance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        logger.error('Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor - Handle errors
    this.instance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Handle unauthorized - only redirect from protected pages
          if (typeof window !== 'undefined') {
            const currentPath = window.location.pathname;
            const publicPaths = ['/login', '/register', '/'];
            const isPublicPage = publicPaths.some(path => currentPath === path || currentPath.startsWith(path + '/'));
            
            // Clear auth data
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            
            // Only redirect if not on a public page
            if (!isPublicPage) {
              window.location.href = '/login';
            }
          }
        }
        return Promise.reject(error);
      }
    );
  }

  private generateRequestKey(config: RequestConfig): string {
    const { method = 'get', url = '', params, data } = config;
    const paramsStr = params ? JSON.stringify(params) : '';
    const dataStr = data ? JSON.stringify(data) : '';
    return `${method}:${url}:${paramsStr}:${dataStr}`;
  }

  private async delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private async retryRequest<T>(
    requestFn: () => Promise<T>,
    retries: number = this.MAX_RETRIES,
    delay: number = this.RETRY_DELAY
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        return await requestFn();
      } catch (error: any) {
        lastError = error;

        // Don't retry on 4xx errors (client errors)
        if (error.response?.status >= 400 && error.response?.status < 500) {
          throw error;
        }

        // Don't retry on abort
        if (error.name === 'AbortError' || error.code === 'ECONNABORTED') {
          throw error;
        }

        // Don't retry on last attempt
        if (attempt === retries) {
          throw error;
        }

        // Exponential backoff
        const waitTime = delay * Math.pow(2, attempt);
        logger.warn(`Request failed, retrying in ${waitTime}ms (attempt ${attempt + 1}/${retries + 1})`);
        await this.delay(waitTime);
      }
    }

    throw lastError || new Error('Request failed after retries');
  }

  private cleanupOldRequests() {
    const now = Date.now();
    const MAX_AGE = 60000; // 1 minute

    for (const [key, request] of this.pendingRequests.entries()) {
      if (now - request.timestamp > MAX_AGE) {
        request.abortController.abort();
        this.pendingRequests.delete(key);
      }
    }
  }

  async request<T = any>(config: RequestConfig): Promise<T> {
    // Cleanup old requests periodically
    this.cleanupOldRequests();

    const requestKey = this.generateRequestKey(config);
    const existingRequest = this.pendingRequests.get(requestKey);

    // Return existing request if it's still pending (deduplication)
    if (existingRequest) {
      logger.debug('Deduplicating request:', requestKey);
      try {
        return await existingRequest.promise;
      } catch (error) {
        // If existing request failed, remove it and continue with new request
        this.pendingRequests.delete(requestKey);
      }
    }

    // Create new abort controller
    const abortController = new AbortController();
    const timeout = config.timeout || this.REQUEST_TIMEOUT;

    // Set up timeout
    const timeoutId = setTimeout(() => {
      abortController.abort();
    }, timeout);

    // Create request promise
    const requestPromise = this.retryRequest(
      async () => {
        try {
          const response = await this.instance.request<T>({
            ...config,
            signal: abortController.signal,
          });
          clearTimeout(timeoutId);
          return response.data;
        } catch (error: any) {
          clearTimeout(timeoutId);
          if (error.name === 'AbortError' || error.code === 'ECONNABORTED') {
            logger.warn('Request aborted:', requestKey);
          }
          throw error;
        }
      },
      config.retries,
      config.retryDelay
    );

    // Store pending request
    const pendingRequest: PendingRequest = {
      promise: requestPromise,
      abortController,
      timestamp: Date.now(),
    };

    this.pendingRequests.set(requestKey, pendingRequest);

    // Clean up after request completes
    requestPromise
      .finally(() => {
        this.pendingRequests.delete(requestKey);
      })
      .catch(() => {
        // Ignore errors in cleanup
      });

    return requestPromise;
  }

  get<T = any>(url: string, config?: RequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'GET', url });
  }

  post<T = any>(url: string, data?: any, config?: RequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'POST', url, data });
  }

  put<T = any>(url: string, data?: any, config?: RequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'PUT', url, data });
  }

  patch<T = any>(url: string, data?: any, config?: RequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'PATCH', url, data });
  }

  delete<T = any>(url: string, config?: RequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'DELETE', url });
  }

  // Cancel all pending requests
  cancelAllRequests() {
    for (const request of this.pendingRequests.values()) {
      request.abortController.abort();
    }
    this.pendingRequests.clear();
  }

  // Cancel specific request
  cancelRequest(config: RequestConfig) {
    const requestKey = this.generateRequestKey(config);
    const request = this.pendingRequests.get(requestKey);
    if (request) {
      request.abortController.abort();
      this.pendingRequests.delete(requestKey);
    }
  }
}

// Create singleton instance
const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
export const apiClient = new APIClient(baseURL);

export default apiClient;

