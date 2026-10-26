import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://abaya-ecommerce.runasp.net';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Event bus / listeners for global notifications (Rate limit 429, Auth expiration 401)
type ApiEventListener = (event: { type: '429' | '401' | 'error'; message: string }) => void;
const listeners: Set<ApiEventListener> = new Set();

export const subscribeToApiEvents = (listener: ApiEventListener) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const notifyApiEvent = (event: { type: '429' | '401' | 'error'; message: string }) => {
  listeners.forEach((listener) => listener(event));
};

// Request Interceptor: Injects Bearer token automatically
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('abaya_auth_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Response Interceptor: Handles 401 expiration, 429 rate limit, and validation arrays
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (typeof window !== 'undefined') {
      if (error.response?.status === 401) {
        localStorage.removeItem('abaya_auth_token');
        localStorage.removeItem('abaya_user');
        notifyApiEvent({
          type: '401',
          message: 'Your session has expired. Please log in again to continue.',
        });
        if (!window.location.pathname.startsWith('/login')) {
          window.location.href = '/login?expired=true';
        }
      } else if (error.response?.status === 429) {
        notifyApiEvent({
          type: '429',
          message: 'Rate limit reached (max 10 requests/min). Please pause for 60 seconds.',
        });
      }
    }
    return Promise.reject(error);
  }
);

// Helper to extract clean error message string or array from backend responses
export const parseApiError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;
    if (data) {
      if (Array.isArray(data.errors) && data.errors.length > 0) {
        return data.errors.join(' ');
      }
      if (typeof data.message === 'string') {
        return data.message;
      }
      if (typeof data.title === 'string') {
        return data.title;
      }
      if (typeof data === 'string') {
        return data;
      }
    }
    if (error.response?.status === 409) {
      return 'You have already submitted a review for this haute couture piece.';
    }
    if (error.response?.status === 429) {
      return 'High demand detected: You have reached the rate limit (10 req/min). Please try again in 1 minute.';
    }
    return error.message || 'An unexpected error occurred. Please try again.';
  }
  return error instanceof Error ? error.message : 'An error occurred while communicating with the atelier.';
};
