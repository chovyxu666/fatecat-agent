
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
      let currentMessageId = `${baseMessageId}_${messageCounter}`;
      let currentMessageCreated = false;

      await chatServiceRef.current.sendMessage(
        requestBody,
        (chunk: string) => {
          currentBuffer += chunk;
          
          // 如果包含换行符，需要分割消息
          if (currentBuffer.includes('\n')) {
            const lines = currentBuffer.split('\n');
            const lastLine = lines.pop() || ''; // 保存最后一行（可能不完整）
            
            // 处理完整的行
            lines.forEach((line, index) => {
              if (line.trim()) {
                const messageId = `${baseMessageId}_${messageCounter}`;
                const newMessage: ChatMessage = {
                  id: messageId,
                  text: line.trim(),
                  sender: 'cat',
                  timestamp: new Date(Date.now() + messageCounter * 100)
                };
                
                setMessages(prev => [...prev, newMessage]);
                messageCounter++;
                console.log(`创建新消息 ${messageId}: ${line.trim()}`);
              }
            });
            
            // 重置缓冲区为最后一行
            currentBuffer = lastLine;
            currentMessageId = `${baseMessageId}_${messageCounter}`;
            currentMessageCreated = false;
            
            setIsLoading(false);
          } else {
            // 没有换行符，更新当前消息
            if (!currentMessageCreated) {
              // 创建新消息
              const newMessage: ChatMessage = {
                id: currentMessageId,
                text: currentBuffer,
                sender: 'cat',
                timestamp: new Date()
              };
              setMessages(prev => [...prev, newMessage]);
              currentMessageCreated = true;
              console.log(`创建当前消息 ${currentMessageId}: ${currentBuffer}`);
            } else {
              // 更新现有消息
              setMessages(prev => 
                prev.map(msg => 
                  msg.id === currentMessageId 
                    ? { ...msg, text: currentBuffer }
                    : msg
                )
              );
              console.log(`更新消息 ${currentMessageId}: ${currentBuffer}`);
            }
            
            setIsLoading(false);
          }
        },
        abortControllerRef.current
      );

      // 处理最后剩余的缓冲区内容
      if (currentBuffer.trim() && !currentMessageCreated) {
        const finalMessage: ChatMessage = {
          id: currentMessageId,
          text: currentBuffer.trim(),
          sender: 'cat',
          timestamp: new Date(Date.now() + messageCounter * 100)
        };
        setMessages(prev => [...prev, finalMessage]);
        console.log(`创建最终消息 ${currentMessageId}: ${currentBuffer.trim()}`);
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
