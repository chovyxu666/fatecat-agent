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

      // 重新设计的消息处理逻辑
      const baseMessageId = Date.now().toString();
      let messageCounter = 0;
      let textBuffer = '';
      let currentMessageId: string | null = null;

      await chatServiceRef.current.sendMessage(
        requestBody,
        (chunk: string) => {
          textBuffer += chunk;
          console.log(`接收到chunk: "${chunk}", 当前缓冲区: "${textBuffer}"`);
          
          // 检查是否有换行符，如果有则处理完整的行
          if (textBuffer.includes('\n')) {
            const lines = textBuffer.split('\n');
            
            // 处理除最后一行外的所有完整行
            for (let i = 0; i < lines.length - 1; i++) {
              const completeLine = lines[i].trim();
              if (completeLine) {
                const completeMessageId = `${baseMessageId}_${messageCounter}`;
                messageCounter++;
                
                const completeMessage: ChatMessage = {
                  id: completeMessageId,
                  text: completeLine,
                  sender: 'cat',
                  timestamp: new Date(Date.now() + messageCounter * 10)
                };
                
                console.log(`创建完整消息: ${completeMessageId} - "${completeLine}"`);
                setMessages(prev => [...prev, completeMessage]);
              }
            }
            
            // 最后一行作为新的缓冲区开始
            textBuffer = lines[lines.length - 1];
            currentMessageId = null; // 重置当前消息ID
          }
          
          // 处理当前行（可能是不完整的）
          if (textBuffer.trim()) {
            if (!currentMessageId) {
              currentMessageId = `${baseMessageId}_${messageCounter}`;
              console.log(`开始新的当前消息: ${currentMessageId}`);
            }
            
            setMessages(prev => {
              const existingIndex = prev.findIndex(msg => msg.id === currentMessageId);
              const updatedMessage: ChatMessage = {
                id: currentMessageId!,
                text: textBuffer.trim(),
                sender: 'cat',
                timestamp: new Date(Date.now() + messageCounter * 10)
              };
              
              if (existingIndex >= 0) {
                // 更新现有消息
                const updated = [...prev];
                updated[existingIndex] = updatedMessage;
                console.log(`更新消息: ${currentMessageId} - "${textBuffer.trim()}"`);
                return updated;
              } else {
                // 创建新消息
                console.log(`创建新消息: ${currentMessageId} - "${textBuffer.trim()}"`);
                return [...prev, updatedMessage];
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
