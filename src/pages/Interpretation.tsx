import { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { cats } from '../data/cats';
import { TarotCardComponent } from '../components/TarotCardComponent';
import { ChevronLeft } from 'lucide-react';
import { ChatService, ChatRequest, ProcessedMessage } from '../services/chatService';
import { getUserId } from '../utils/userIdUtils';
import { ScrollArea } from '../components/ui/scroll-area';

const Interpretation = () => {
  const { catId } = useParams<{ catId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [animationPhase, setAnimationPhase] = useState<'initial' | 'hideHeader' | 'moveCards' | 'showText' | 'complete'>('initial');
  const [displayedText, setDisplayedText] = useState('');
  const [textComplete, setTextComplete] = useState(false);
  const [interpretation, setInterpretation] = useState('');
  const [fullInterpretation, setFullInterpretation] = useState(''); // 保存完整的解读内容
  const [isLoading, setIsLoading] = useState(false);
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
      // 完整消息：累积到完整解读内容中
      setFullInterpretation(prev => prev + processedMessage.text);
      setIsLoading(false);
    } else {
      // 流式消息：更新当前显示的解读内容
      setInterpretation(processedMessage.text);
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
      setInterpretation('抱歉，我现在无法为你提供解读。请稍后再试。');
      setFullInterpretation('抱歉，我现在无法为你提供解读。请稍后再试。');
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
      // 在页面初始化时就开始获取解读
      fetchInterpretation();
    }, 1800);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  // 当解读内容获取完成后，开始文字动画
  useEffect(() => {
    if (fullInterpretation && animationPhase === 'showText' && !displayedText && !isLoading) {
      startTextAnimation();
    }
  }, [fullInterpretation, animationPhase, isLoading]);

  const startTextAnimation = () => {
    if (!fullInterpretation) return;
    
    let index = 0;
    const interval = setInterval(() => {
      if (index < fullInterpretation.length) {
        setDisplayedText(fullInterpretation.slice(0, index + 1));
        index++;
      } else {
        clearInterval(interval);
        setTextComplete(true);
        setTimeout(() => {
          setAnimationPhase('complete');
        }, 300);
      }
    }, 30);
  };

  const handleChatMore = () => {
    // 传递完整的解读消息到聊天页面，使用完整的解读内容
    const interpretationMessage = {
      id: 'interpretation_' + Date.now(),
      text: fullInterpretation, // 使用完整的解读内容
      sender: 'cat' as const,
      timestamp: new Date()
    };

    navigate(`/chat/${catId}`, { 
      state: { 
        question,
        cards,
        initialMessages: [interpretationMessage]
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

          {/* Interpretation - 显示累积的完整解读内容 */}
          <div className={`px-6 mt-4 transition-all duration-1000 ${
            animationPhase === 'showText' || animationPhase === 'complete'
              ? 'opacity-100' 
              : 'opacity-0 translate-y-8'
          } ${
            animationPhase === 'moveCards' || animationPhase === 'showText' || animationPhase === 'complete'
              ? '-translate-y-32'
              : 'translate-y-0'
          }`}>
            <div className="bg-white/10 rounded-2xl border border-white/20 max-h-80">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span className="ml-3 text-white text-sm">正在为你解读...</span>
                </div>
              ) : (
                <ScrollArea className="h-full max-h-80">
                  <div className="p-4">
                    <p className="text-white leading-relaxed text-sm text-center whitespace-pre-line">
                      {isLoading ? (interpretation || fullInterpretation) : (displayedText || fullInterpretation)}
                      {!textComplete && animationPhase === 'showText' && !isLoading && <span className="animate-pulse">|</span>}
                    </p>
                  </div>
                </ScrollArea>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Action Button - 改为固定浮动位置 */}
      <div className="fixed bottom-0 left-0 right-0 p-4 z-50 bg-gradient-to-t from-black/20 to-transparent">
        <button
          onClick={handleChatMore}
          disabled={isLoading || !fullInterpretation}
          className={`w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-500 disabled:cursor-not-allowed rounded-full py-3 text-white font-bold text-lg flex items-center justify-center space-x-3 border-4 border-orange-400 shadow-2xl transition-all duration-500 ${
            animationPhase === 'complete' && !isLoading && fullInterpretation
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
