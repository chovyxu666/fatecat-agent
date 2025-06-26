
export const API_CONFIG = {
  BASE_URL: import.meta.env.DEV ? '/api' : 'http://192.168.124.212:5000',
  ENDPOINTS: {
    CHAT_STREAM: '/chat/stream'
  }
};

export const getApiUrl = (endpoint: string) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};
