import { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { cats } from '../data/cats';
import { TarotCardComponent } from '../components/TarotCardComponent';
import { ChevronLeft } from 'lucide-react';
import { ChatService, ChatRequest, ProcessedMessage } from '../services/chatService';
import { getUserId } from '../utils/userIdUtils';

const Interpretation = () => {
  const { catId } = useParams<{ catId: string }>();
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

  const cat = cats.find(c => c.id === catId);
  const question = location.state?.question || '';
  const cards = location.state?.cards || [];

  if (!cat) {
    return <div>Cat not found</div>;
  }

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
    if (processedMessage.isComplete) {
      setInterpretationMessages(prev => [...prev, processedMessage.text]);
      setCurrentStreamText('');
      setIsLoading(false);
    } else {
      const newText = processedMessage.text;
      setCurrentStreamText(newText);
      
      if (newText.includes('\n')) {
        const lines = newText.split('\n');
        const completeLines = lines.slice(0, -1).filter(line => line.trim());
        if (completeLines.length > 0) {
          setInterpretationMessages(prev => [...prev, ...completeLines]);
        }
        setCurrentStreamText(lines[lines.length - 1] || '');
      }
    }
  };

  // 调用聊天接口获取解读
  const fetchInterpretation = async () => {
    if (!question.trim() || cards.length === 0) return;

    setIsLoading(true);

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
    if (interpretationMessages.length > 0 && animationPhase === 'showText' && !isLoading && !isTyping) {
      startTextAnimation();
    }
  }, [interpretationMessages, animationPhase, isLoading, isTyping]);

  const startTextAnimation = () => {
    if (interpretationMessages.length === 0 || currentDisplayIndex >= interpretationMessages.length) return;
    
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
        // 当前消息完成，移动到下一个消息
        clearInterval(interval);
        setCurrentDisplayIndex(prev => prev + 1);
        setCurrentCharIndex(0);
        setIsTyping(false);
        
        // 如果还有更多消息，继续
        if (currentDisplayIndex + 1 < interpretationMessages.length) {
          setTimeout(() => {
            setIsTyping(true);
          }, 500); // 间隔500ms再开始下一条
        } else {
          // 所有消息完成
          setTimeout(() => {
            setAnimationPhase('complete');
          }, 300);
        }
      }
    }, 30);
  };

  const handleChatMore = () => {
    const allMessages = [...interpretationMessages];
    if (currentStreamText.trim()) {
      allMessages.push(currentStreamText);
    }
    
    const interpretationMessagesForChat = allMessages.flatMap(text => 
      text.split('\n').filter(line => line.trim()).map((line, index) => ({
        id: `interpretation_${Date.now()}_${index}`,
        text: line.trim(),
        sender: 'cat' as const,
        timestamp: new Date()
      }))
    );

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

  return (
    <div className={`min-h-screen bg-gradient-to-br ${cat.color} relative overflow-auto`}>
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}></div>
      
      <div className="relative z-10 flex flex-col pb-20">
        {/* Header */}
        <div className="flex items-center justify-between p-4 pt-8">
          <button 
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <div className="flex-1" />
        </div>

        {/* Cat Avatar and Title - 隐藏动画 */}
        <div className={`text-center px-6 mb-4 transition-all duration-500 ${
          animationPhase === 'hideHeader' || animationPhase === 'moveCards' || animationPhase === 'showText' || animationPhase === 'complete'
            ? 'opacity-0 -translate-y-4' 
            : 'opacity-100'
        }`}>
          <div className="w-24 h-24 mx-auto rounded-full overflow-hidden border-4 border-white/20 mb-3">
            <img 
              src={cat.avatar} 
              alt={cat.name}
              className="w-full h-full object-cover"
            />
          </div>
          <h2 className="text-white text-lg font-bold mb-1">你好呀，我是{cat.name}</h2>
          <h3 className="text-white text-lg font-bold">这是你抽到的牌</h3>
        </div>

        {/* Cards and Interpretation Container */}
        <div className="flex flex-col">
          {/* Cards container - 向上调整40% */}
          <div className={`flex justify-center space-x-2 px-4 w-full max-w-sm mx-auto transition-all duration-1000 ${
            animationPhase === 'moveCards' || animationPhase === 'showText' || animationPhase === 'complete'
              ? '-translate-y-32 mt-2'
              : 'translate-y-0'
          }`}>
            {cards.map((card: any, index: number) => (
              <div key={card.id} className="flex-1">
                <TarotCardComponent
                  card={card}
                  revealed={true}
                  size="medium"
                />
              </div>
            ))}
          </div>

          {/* Interpretation - 水平滚动显示多条消息 */}
          <div className={`px-6 mt-4 transition-all duration-1000 ${
            animationPhase === 'showText' || animationPhase === 'complete'
              ? 'opacity-100' 
              : 'opacity-0 translate-y-8'
          } ${
            animationPhase === 'moveCards' || animationPhase === 'showText' || animationPhase === 'complete'
              ? '-translate-y-32'
              : 'translate-y-0'
          }`}>
            {isLoading ? (
              <div className="bg-white/10 rounded-2xl border border-white/20 p-4">
                <div className="flex items-center justify-center py-8">
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span className="ml-3 text-white text-sm">正在为你解读...</span>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <div className="flex space-x-4 pb-2">
                  {/* 显示已完成的消息 */}
                  {displayedMessages.map((message, index) => (
                    <div key={index} className="flex-shrink-0 w-72">
                      <div className="bg-white/10 rounded-2xl border border-white/20 p-4 min-h-20">
                        <p className="text-white leading-relaxed text-sm text-center whitespace-pre-line">
                          {message}
                          {index === currentDisplayIndex - 1 && isTyping && 
                            <span className="animate-pulse">|</span>
                          }
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {/* 显示正在输入的消息 */}
                  {isTyping && currentDisplayIndex < interpretationMessages.length && (
                    <div className="flex-shrink-0 w-72">
                      <div className="bg-white/10 rounded-2xl border border-white/20 p-4 min-h-20">
                        <p className="text-white leading-relaxed text-sm text-center whitespace-pre-line">
                          {displayedMessages[currentDisplayIndex] || ''}
                          <span className="animate-pulse">|</span>
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {/* 显示当前流式文本 */}
                  {currentStreamText.trim() && (
                    <div className="flex-shrink-0 w-72">
                      <div className="bg-white/10 rounded-2xl border border-white/20 p-4 min-h-20">
                        <p className="text-white leading-relaxed text-sm text-center whitespace-pre-line">
                          {currentStreamText}
                          <span className="animate-pulse">|</span>
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Button - 改为固定浮动位置 */}
      <div className="fixed bottom-0 left-0 right-0 p-4 z-50 bg-gradient-to-t from-black/20 to-transparent">
        <button
          onClick={handleChatMore}
          disabled={isLoading || (interpretationMessages.length === 0 && !currentStreamText)}
          className={`w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-500 disabled:cursor-not-allowed rounded-full py-3 text-white font-bold text-lg flex items-center justify-center space-x-3 border-4 border-orange-400 shadow-2xl transition-all duration-500 ${
            animationPhase === 'complete' && !isLoading && (interpretationMessages.length > 0 || currentStreamText)
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-4 pointer-events-none'
          }`}
        >
          <span>💬</span>
          <span>我想聊更多</span>
        </button>
      </div>
    </div>
  );
};

export default Interpretation;
