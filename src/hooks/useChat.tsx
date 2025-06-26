
import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChatMessage } from '../types';
import { ChatService, ChatRequest } from '../services/chatService';
import { getUserId } from '../utils/userIdUtils';

export const useChat = (catId: string | undefined) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFirstMessage, setIsFirstMessage] = useState(true);
  const abortControllerRef = useRef<AbortController | null>(null);
  const chatServiceRef = useRef(new ChatService());

  const cards = location.state?.cards || [];
  const question = location.state?.question || ''; // 获取问题页面传递的问题

  // 初始化验证 - 如果question为空或cards为空则跳转到首页
  useEffect(() => {
    if (!question.trim() || cards.length === 0) {
      navigate('/');
      return;
    }
  }, [question, cards, navigate]);

  // 格式化塔罗牌信息
  const formatTarotCards = () => {
    if (cards.length === 0) return '';
    
    const positions = ['过去', '现在', '未来'];
    const cardDescriptions = cards.map((card: any, index: number) => {
      const orientation = card.isReversed ? '逆位' : '正位';
      return `${positions[index]}：${card.name}（${orientation}）`;
    });
    
    return cardDescriptions.join('\n');
  };

  // 处理消息分割函数
  const splitMessageByNewlines = (text: string): string[] => {
    return text.split('\n').filter(line => line.trim().length > 0);
  };

  const sendMessageToBackend = async (messageText: string) => {
    setIsLoading(true);

    // 取消之前的请求
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    try {
      const requestBody: ChatRequest = {
        user_id: getUserId(), // 使用缓存的用户ID
        message: messageText
      };

      // 第一次发送消息时包含塔罗牌信息
      if (isFirstMessage) {
        requestBody.tarot = formatTarotCards();
        setIsFirstMessage(false);
      }

      // 创建猫咪回复消息的ID
      const catMessageId = (Date.now() + 1).toString();
      let catMessageCreated = false;
      let accumulatedText = '';

      await chatServiceRef.current.sendMessage(
        requestBody,
        (chunk: string) => {
          accumulatedText += chunk;
          
          // 只有在第一次接收到数据时才创建猫咪消息
          if (!catMessageCreated) {
            const catMessage: ChatMessage = {
              id: catMessageId,
              text: chunk,
              sender: 'cat',
              timestamp: new Date()
            };
            setMessages(prev => [...prev, catMessage]);
            catMessageCreated = true;
            // 接收到第一个数据块时隐藏加载指示器
            setIsLoading(false);
          } else {
            // 后续的数据块追加到现有消息
            setMessages(prev => 
              prev.map(msg => 
                msg.id === catMessageId 
                  ? { ...msg, text: accumulatedText }
                  : msg
              )
            );
          }
        },
        abortControllerRef.current
      );

      // 流式传输完成后，检查是否需要按换行符分割
      setTimeout(() => {
        // 只有当消息包含换行符时才分割
        if (accumulatedText.includes('\n')) {
          const messageParts = splitMessageByNewlines(accumulatedText);
          
          if (messageParts.length > 1) {
            // 如果有多个部分，替换原消息为多个消息
            setMessages(prev => {
              const filteredMessages = prev.filter(msg => msg.id !== catMessageId);
              const newMessages = messageParts.map((part, index) => ({
                id: `${catMessageId}_${index}`,
                text: part.trim(),
                sender: 'cat' as const,
                timestamp: new Date(Date.now() + index * 100) // 稍微错开时间戳
              }));
              return [...filteredMessages, ...newMessages];
            });
          }
        }
      }, 500); // 延迟500ms确保流式传输完成

    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('请求被取消');
        return;
      }
      
      console.error('发送消息失败:', error);
      
      // 添加错误消息
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: '抱歉，我现在无法回复你。请稍后再试。',
        sender: 'cat',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: message.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentMessage = message.trim();
    setMessage('');

    await sendMessageToBackend(currentMessage);
  };

  // 组件初始化时自动发送问题
  useEffect(() => {
    if (isFirstMessage && question.trim() && cards.length > 0) {
      sendMessageToBackend(question); // 传入问题页面的问题
    }
  }, [question, cards]);

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    message,
    setMessage,
    messages,
    isLoading,
    handleSendMessage
  };
};
