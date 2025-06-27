
import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChatService, ChatRequest, ProcessedMessage } from '../services/chatService';
import { getUserId } from '../utils/userIdUtils';

export const useInterpretation = (catId: string | undefined) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [animationPhase, setAnimationPhase] = useState<'initial' | 'hideHeader' | 'moveCards' | 'showText' | 'complete'>('initial');
  const [interpretationMessages, setInterpretationMessages] = useState<string[]>([]);
  const [currentStreamText, setCurrentStreamText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [displayedMessages, setDisplayedMessages] = useState<string[]>([]);
  const [currentDisplayIndex, setCurrentDisplayIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const chatServiceRef = useRef(new ChatService());

  const question = location.state?.question || '';
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

  // 处理从聊天服务返回的消息
  const handleProcessedMessage = (processedMessage: ProcessedMessage) => {
    console.log('Received processed message:', processedMessage);
    
    if (processedMessage.isComplete) {
      // 流式传输完成，处理完整文本
      const fullText = processedMessage.text.trim();
      if (fullText) {
        // 按两个换行符分割成多条消息（每条解读信息通常用双换行分隔）
        let messages = fullText.split('\n\n').filter(msg => msg.trim().length > 0);
        
        // 如果没有双换行符分隔，尝试单换行符分割
        if (messages.length === 1) {
          messages = fullText.split('\n').filter(msg => msg.trim().length > 0);
        }
        
        // 确保每条消息都有内容
        const validMessages = messages.map(msg => msg.trim()).filter(msg => msg.length > 0);
        
        console.log('Split complete messages:', validMessages);
        setInterpretationMessages(validMessages);
      }
      setCurrentStreamText('');
      setIsLoading(false);
    } else {
      // 流式传输中，更新当前文本
      setCurrentStreamText(processedMessage.text);
    }
  };

  // 调用聊天接口获取解读
  const fetchInterpretation = async () => {
    if (!question.trim() || cards.length === 0) return;

    setIsLoading(true);
    setInterpretationMessages([]);
    setCurrentStreamText('');

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    try {
      const requestBody: ChatRequest = {
        user_id: getUserId(),
        message: question,
        tarot: formatTarotCards()
      };

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
      
      console.error('获取解读失败:', error);
      setInterpretationMessages(['抱歉，我现在无法为你提供解读。请稍后再试。']);
      setIsLoading(false);
    }
  };

  // 初始动画序列
  useEffect(() => {
    const timer1 = setTimeout(() => {
      setAnimationPhase('hideHeader');
    }, 300);

    const timer2 = setTimeout(() => {
      setAnimationPhase('moveCards');
    }, 800);

    const timer3 = setTimeout(() => {
      setAnimationPhase('showText');
      fetchInterpretation();
    }, 1800);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  // 当解读消息获取完成后，开始文字动画
  useEffect(() => {
    if (interpretationMessages.length > 0 && animationPhase === 'showText' && !isLoading) {
      console.log('Starting text animation with messages:', interpretationMessages);
      setDisplayedMessages(new Array(interpretationMessages.length).fill(''));
      setCurrentDisplayIndex(0);
      setCurrentCharIndex(0);
      setIsTyping(false);
      
      // 开始第一条消息的动画
      setTimeout(() => {
        startTextAnimation();
      }, 500);
    }
  }, [interpretationMessages, animationPhase, isLoading]);

  const startTextAnimation = () => {
    if (interpretationMessages.length === 0 || currentDisplayIndex >= interpretationMessages.length) {
      setAnimationPhase('complete');
      return;
    }
    
    console.log(`Starting animation for message ${currentDisplayIndex}: "${interpretationMessages[currentDisplayIndex]}"`);
    setIsTyping(true);
    const currentMessage = interpretationMessages[currentDisplayIndex];
    
    const interval = setInterval(() => {
      if (currentCharIndex < currentMessage.length) {
        setDisplayedMessages(prev => {
          const newMessages = [...prev];
          newMessages[currentDisplayIndex] = currentMessage.slice(0, currentCharIndex + 1);
          return newMessages;
        });
        setCurrentCharIndex(prev => prev + 1);
      } else {
        // 当前消息完成
        clearInterval(interval);
        setIsTyping(false);
        
        // 如果还有更多消息，继续下一个
        if (currentDisplayIndex + 1 < interpretationMessages.length) {
          setTimeout(() => {
            setCurrentDisplayIndex(prev => prev + 1);
            setCurrentCharIndex(0);
            startTextAnimation();
          }, 800); // 间隔800ms再开始下一条
        } else {
          // 所有消息完成
          setTimeout(() => {
            setAnimationPhase('complete');
          }, 500);
        }
      }
    }, 30);
  };

  const handleChatMore = () => {
    // 将所有解读消息传递给聊天页面，每条消息单独处理
    const interpretationMessagesForChat = interpretationMessages.map((text, index) => ({
      id: `interpretation_${Date.now()}_${index}`,
      text: text.trim(),
      sender: 'cat' as const,
      timestamp: new Date()
    }));

    navigate(`/chat/${catId}`, { 
      state: { 
        question,
        cards,
        initialMessages: interpretationMessagesForChat
      } 
    });
  };

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    animationPhase,
    interpretationMessages,
    currentStreamText,
    isLoading,
    displayedMessages,
    currentDisplayIndex,
    isTyping,
    handleChatMore,
    question,
    cards
  };
};
