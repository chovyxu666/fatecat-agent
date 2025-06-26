
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

      // 重新设计的消息处理逻辑 - 简化版本
      let textBuffer = '';
      let messageCounter = 0;
      const baseMessageId = Date.now().toString();

      await chatServiceRef.current.sendMessage(
        requestBody,
        (chunk: string) => {
          console.log(`接收到chunk: "${chunk}"`);
          textBuffer += chunk;
          
          // 检查是否包含句号，如果有则创建完整消息
          if (chunk.includes('.')) {
            // 创建完整消息
            const completeMessageId = `${baseMessageId}_${messageCounter}`;
            messageCounter++;
            
            const completeMessage: ChatMessage = {
              id: completeMessageId,
              text: textBuffer.trim(),
              sender: 'cat',
              timestamp: new Date(Date.now() + messageCounter * 10)
            };
            
            console.log(`创建完整消息: ${completeMessageId} - "${textBuffer.trim()}"`);
            
            setMessages(prev => {
              // 检查是否已存在相同ID的消息，避免重复
              const exists = prev.some(msg => msg.id === completeMessageId);
              if (!exists) {
                return [...prev, completeMessage];
              }
              return prev;
            });
            
            // 清空缓冲区，开始新消息
            textBuffer = '';
          } else {
            // 没有句号，继续更新当前消息
            const currentMessageId = `${baseMessageId}_current`;
            
            setMessages(prev => {
              const existingIndex = prev.findIndex(msg => msg.id === currentMessageId);
              const updatedMessage: ChatMessage = {
                id: currentMessageId,
                text: textBuffer.trim(),
                sender: 'cat',
                timestamp: new Date()
              };
              
              if (existingIndex >= 0) {
                // 更新现有消息
                const updated = [...prev];
                updated[existingIndex] = updatedMessage;
                return updated;
              } else {
                // 创建新的临时消息
                return [...prev, updatedMessage];
              }
            });
          }
          
          setIsLoading(false);
        },
        abortControllerRef.current
      );

      // 流结束后，如果还有未完成的文本，创建最终消息
      if (textBuffer.trim()) {
        const finalMessageId = `${baseMessageId}_${messageCounter}`;
        const finalMessage: ChatMessage = {
          id: finalMessageId,
          text: textBuffer.trim(),
          sender: 'cat',
          timestamp: new Date()
        };
        
        setMessages(prev => {
          // 移除临时消息，添加最终消息
          const filtered = prev.filter(msg => !msg.id.includes('_current'));
          const exists = filtered.some(msg => msg.id === finalMessageId);
          if (!exists) {
            return [...filtered, finalMessage];
          }
          return filtered;
        });
      }

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
