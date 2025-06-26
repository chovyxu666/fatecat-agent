
// 环境配置
const ENV_CONFIG = {
  development: {
    BASE_URL: '/api', // 开发环境使用代理
    BACKEND_URL: 'http://192.168.124.212:5000' // 开发环境后端地址
  },
  production: {
    BASE_URL: 'http://192.168.124.212:5000', // 生产环境直接请求后端
    BACKEND_URL: 'http://192.168.124.212:5000' // 生产环境后端地址
  }
};

// 获取当前环境
const getCurrentEnv = (): 'development' | 'production' => {
  return import.meta.env.DEV ? 'development' : 'production';
};

// 获取当前环境配置
const getCurrentConfig = () => {
  return ENV_CONFIG[getCurrentEnv()];
};

export const API_CONFIG = {
  BASE_URL: getCurrentConfig().BASE_URL,
  BACKEND_URL: getCurrentConfig().BACKEND_URL,
  ENDPOINTS: {
    CHAT_STREAM: '/chat/stream'
  }
};

export const getApiUrl = (endpoint: string) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// 导出环境相关的工具函数
export const getEnvironment = getCurrentEnv;
export const isProduction = () => getCurrentEnv() === 'production';
export const isDevelopment = () => getCurrentEnv() === 'development';
