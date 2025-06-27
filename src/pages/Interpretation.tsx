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
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [newMessageToType, setNewMessageToType] = useState('');
  const [isStreamComplete, setIsStreamComplete] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const chatServiceRef = useRef(new ChatService());
  const typingIntervalRef = useRef<NodeJS.Timeout | null>(null);

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

  // 检查内容是否已经存在
  const isContentAlreadyDisplayed = (newContent: string) => {
    const currentDisplayed = getDisplayContent();
    return currentDisplayed.includes(newContent.trim());
  };

  // 打字动画效果 - 添加换行延迟和重复检查
  const startTypingAnimation = (newMessage: string) => {
    // 检查内容是否已经存在
    if (isContentAlreadyDisplayed(newMessage)) {
      console.log('内容已存在，跳过打字动画');
      setAnimationPhase('complete');
      return;
    }

    setIsTyping(true);
    setNewMessageToType('');
    let currentIndex = 0;

    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
    }

    const typeNextCharacter = () => {
      if (currentIndex < newMessage.length) {
        const nextChar = newMessage[currentIndex];
        setNewMessageToType(newMessage.substring(0, currentIndex + 1));
        currentIndex++;

        // 如果遇到换行符，延迟200毫秒
        if (nextChar === '\n') {
          setTimeout(() => {
            typingIntervalRef.current = setTimeout(typeNextCharacter, 15);
          }, 200);
        } else {
          typingIntervalRef.current = setTimeout(typeNextCharacter, 15);
        }
      } else {
        clearTimeout(typingIntervalRef.current!);
        setIsTyping(false);
        
        // 动画完成后，将消息添加到已完成消息数组
        setInterpretationMessages(prev => [...prev, newMessage]);
        setNewMessageToType('');
        setAnimationPhase('complete');
      }
    };

    typeNextCharacter();
  };

  // 处理从聊天服务返回的消息
  const handleProcessedMessage = (processedMessage: ProcessedMessage) => {
    if (processedMessage.isComplete) {
      // 完整消息：开始打字动画（不立即添加到消息数组）
      const newMessage = processedMessage.text;
      setCurrentStreamText('');
      setIsLoading(false);

      // 开始打字动画
      startTypingAnimation(newMessage);
    } else {
      // 流式消息：更新当前流文本
      setCurrentStreamText(processedMessage.text);
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

      // 当所有流都完成后，设置流完成状态
      setIsStreamComplete(true);

    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('请求被取消');
        return;
      }

      console.error('获取解读失败:', error);
      const errorMessage = '抱歉，我现在无法为你提供解读。请稍后再试。';
      setInterpretationMessages([errorMessage]);
      setIsLoading(false);
      startTypingAnimation(errorMessage);
      setIsStreamComplete(true);
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

  const handleChatMore = () => {
    // 将所有解读消息整合成一条完整的消息
    const allMessages = [...interpretationMessages];

    if (currentStreamText.trim()) {
      allMessages.push(currentStreamText);
    }
    // 整合成一条消息，保留换行符格式
    const combinedMessage = allMessages.join('\n\n').trim();

    const interpretationMessagesForChat = [{
      id: `interpretation_${Date.now()}`,
      text: combinedMessage,
      sender: 'cat' as const,
      timestamp: new Date()
    }];

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
      if (typingIntervalRef.current) {
        clearTimeout(typingIntervalRef.current);
      }
    };
  }, []);

  // 获取要显示的文本内容
  const getDisplayContent = () => {
    // 构建已完成的消息内容
    let content = '';
    if (interpretationMessages.length > 0) {
      content = interpretationMessages.join('\n\n');
    }

    // 如果正在打字，添加正在打字的新消息
    if (isTyping && newMessageToType) {
      if (content) {
        content += '\n\n' + newMessageToType;
      } else {
        content = newMessageToType;
      }
    }
    // 如果有流式文本且不在打字状态，添加流式文本
    else if (currentStreamText && !isTyping) {
      if (content) {
        content += '\n\n' + currentStreamText;
      } else {
        content = currentStreamText;
      }
    }

    // 处理换行符，将 \n 转换为实际换行
    return content.replace(/\\n/g, '\n');
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${cat.color} relative`}>
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}></div>

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header */}
        <div className="flex items-center justify-between p-4 pt-8">
          <button
            onClick={() => navigate('/')}
            className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <div className="flex-1" />
        </div>

        {/* Cat Avatar and Title - 隐藏动画 */}
        <div className={`text-center px-6 mb-4 transition-all duration-500 ${animationPhase === 'hideHeader' || animationPhase === 'moveCards' || animationPhase === 'showText' || animationPhase === 'complete'
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

        {/* Cards container - 向上调整40% */}
        <div className={`flex justify-center space-x-2 px-4 w-full max-w-sm mx-auto transition-all duration-1000 ${animationPhase === 'moveCards' || animationPhase === 'showText' || animationPhase === 'complete'
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

        <div className={`flex-1 px-6 mt-4 pb-24 transition-all duration-1000 ${animationPhase === 'showText' || animationPhase === 'complete'
          ? 'opacity-100'
          : 'opacity-0 translate-y-8'
          } ${animationPhase === 'moveCards' || animationPhase === 'showText' || animationPhase === 'complete'
            ? '-translate-y-32'
            : 'translate-y-0'
          }`}>
          {isLoading && !currentStreamText && !getDisplayContent() ? (
            <div className="bg-white/10 rounded-2xl border border-white/20 p-6 flex items-center justify-center">
              <div className="flex items-center">
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span className="ml-3 text-white text-sm">正在为你解读...</span>
              </div>
            </div>
          ) : (
            <div className="bg-white/10 rounded-2xl border border-white/20 p-6 ">
              <div className="text-white leading-relaxed text-sm whitespace-pre-line">
                {getDisplayContent()}
                {isTyping && <span className="animate-pulse">|</span>}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 z-50 bg-gradient-to-t from-black/20 to-transparent">
        <button
          onClick={handleChatMore}
          disabled={!isStreamComplete || isLoading}
          className={`w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-500 disabled:cursor-not-allowed rounded-full py-3 text-white font-bold text-lg flex items-center justify-center space-x-3 border-4 border-orange-400 shadow-2xl transition-all duration-500 ${isStreamComplete && !isLoading
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
