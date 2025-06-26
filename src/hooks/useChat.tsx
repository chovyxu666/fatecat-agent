import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChatMessage } from '../types';
import { ChatService, ChatRequest, ProcessedMessage } from '../services/chatService';
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
  const question = location.state?.question || '';

  // 初始化验证
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

  const handleProcessedMessage = (processedMessage: ProcessedMessage) => {
    setMessages(prev => {
      if (processedMessage.isComplete) {
        // 完整消息：移除临时消息，添加完整消息
        const filtered = prev.filter(msg => !msg.id.includes('_current'));
        const exists = filtered.some(msg => msg.id === processedMessage.id);
        
        if (!exists) {
          const completeMessage: ChatMessage = {
            id: processedMessage.id,
            text: processedMessage.text,
            sender: 'cat',
            timestamp: new Date()
          };
          
          console.log(`创建完整消息: ${processedMessage.id} - "${processedMessage.text}"`);
          return [...filtered, completeMessage];
        }
        return filtered;
      } else {
        // 临时消息：更新或创建
        const existingIndex = prev.findIndex(msg => msg.id === processedMessage.id);
        const tempMessage: ChatMessage = {
          id: processedMessage.id,
          text: processedMessage.text,
          sender: 'cat',
          timestamp: new Date()
        };
        
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = tempMessage;
          return updated;
        } else {
          return [...prev, tempMessage];
        }
      }
    });
    
    setIsLoading(false);
  };

  const sendMessageToBackend = async (messageText: string) => {
    setIsLoading(true);

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    try {
      const requestBody: ChatRequest = {
        user_id: getUserId(),
        message: messageText
      };

      if (isFirstMessage) {
        requestBody.tarot = formatTarotCards();
        setIsFirstMessage(false);
      }

      await chatServiceRef.current.sendMessage(
        requestBody,
        handleProcessedMessage,
        abortControllerRef.current
      );

    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('请求被取消');
        return;
      }
      
      console.error('发送消息失败:', error);
      
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
      sendMessageToBackend(question);
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
