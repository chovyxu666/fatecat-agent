
import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ChatMessage } from '../types';
import { ChatService, ChatRequest } from '../services/chatService';

export const useChat = (catId: string | undefined) => {
  const location = useLocation();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      text: location.state?.interpretation || '感谢你的提问，如果你还有什么想了解的，请随时告诉我。',
      sender: 'cat',
      timestamp: new Date()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFirstMessage, setIsFirstMessage] = useState(true);
  const abortControllerRef = useRef<AbortController | null>(null);
  const chatServiceRef = useRef(new ChatService());

  const cards = location.state?.cards || [];

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
    setIsLoading(true);

    // 取消之前的请求
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    try {
      const requestBody: ChatRequest = {
        user_id: "123",
        message: currentMessage
      };

      // 第一次发送消息时包含塔罗牌信息
      if (isFirstMessage) {
        requestBody.tarot = formatTarotCards();
        setIsFirstMessage(false);
      }

      // 创建猫咪回复消息的ID
      const catMessageId = (Date.now() + 1).toString();
      let catMessageCreated = false;

      await chatServiceRef.current.sendMessage(
        requestBody,
        (chunk: string) => {
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
                  ? { ...msg, text: msg.text + chunk }
                  : msg
              )
            );
          }
        },
        abortControllerRef.current
      );

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
