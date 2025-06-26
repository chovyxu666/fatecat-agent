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

      // 简化的消息处理逻辑
      const baseMessageId = Date.now().toString();
      let messageCounter = 0;
      let currentBuffer = '';

      await chatServiceRef.current.sendMessage(
        requestBody,
        (chunk: string) => {
          currentBuffer += chunk;
          
          // 检查是否包含换行符
          if (currentBuffer.includes('\n')) {
            const lines = currentBuffer.split('\n');
            
            // 处理除最后一行外的所有行（这些是完整的消息）
            for (let i = 0; i < lines.length - 1; i++) {
              const line = lines[i].trim();
              if (line) {
                const messageId = `${baseMessageId}_${messageCounter}`;
                const newMessage: ChatMessage = {
                  id: messageId,
                  text: line,
                  sender: 'cat',
                  timestamp: new Date(Date.now() + messageCounter * 100)
                };
                
                setMessages(prev => [...prev, newMessage]);
                messageCounter++;
                console.log(`创建完整消息 ${messageId}: ${line}`);
              }
            }
            
            // 最后一行可能是不完整的，重置缓冲区
            currentBuffer = lines[lines.length - 1];
          }
          
          // 如果当前缓冲区有内容且没有换行符，更新或创建当前消息
          if (currentBuffer.trim()) {
            const currentMessageId = `${baseMessageId}_${messageCounter}`;
            
            setMessages(prev => {
              const existingMessageIndex = prev.findIndex(msg => msg.id === currentMessageId);
              
              if (existingMessageIndex >= 0) {
                // 更新现有消息
                const updatedMessages = [...prev];
                updatedMessages[existingMessageIndex] = {
                  ...updatedMessages[existingMessageIndex],
                  text: currentBuffer.trim()
                };
                return updatedMessages;
              } else {
                // 创建新消息
                const newMessage: ChatMessage = {
                  id: currentMessageId,
                  text: currentBuffer.trim(),
                  sender: 'cat',
                  timestamp: new Date(Date.now() + messageCounter * 100)
                };
                console.log(`创建当前消息 ${currentMessageId}: ${currentBuffer.trim()}`);
                return [...prev, newMessage];
              }
            });
          }
          
          setIsLoading(false);
        },
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
