
// 生成6位随机数字用户ID
const generateUserId = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// 从本地存储获取用户ID，如果不存在则生成新的
export const getUserId = (): string => {
  const USER_ID_KEY = 'tarot_chat_user_id';
  
  let userId = localStorage.getItem(USER_ID_KEY);
  
  if (!userId) {
    userId = generateUserId();
    localStorage.setItem(USER_ID_KEY, userId);
  }
  
  return userId;
};

// 清除用户ID（如果需要重置）
export const clearUserId = (): void => {
  localStorage.removeItem('tarot_chat_user_id');
};
