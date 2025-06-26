
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // 自动跳转到首页
    navigate('/', { replace: true });
  }, [navigate]);

  // 返回null或者一个简单的加载指示器，因为会立即跳转
  return null;
};

export default NotFound;
