
import { httpClient } from '../utils/httpClient';
import { getApiUrl } from '../config/api';

class ApiService {
  async get<T = any>(endpoint: string, options?: any) {
    return httpClient.get<T>(getApiUrl(endpoint), options);
  }

  async post<T = any>(endpoint: string, body?: any, options?: any) {
    return httpClient.post<T>(getApiUrl(endpoint), body, options);
  }

  async put<T = any>(endpoint: string, body?: any, options?: any) {
    return httpClient.put<T>(getApiUrl(endpoint), body, options);
  }

  async delete<T = any>(endpoint: string, options?: any) {
    return httpClient.delete<T>(getApiUrl(endpoint), options);
  }

  async stream(endpoint: string, body?: any, options?: any) {
    return httpClient.stream(getApiUrl(endpoint), body, options);
  }
}

export const apiService = new ApiService();
