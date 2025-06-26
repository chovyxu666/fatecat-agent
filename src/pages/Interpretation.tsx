import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { cats } from '../data/cats';
import { TarotCardComponent } from '../components/TarotCardComponent';
import { ChevronLeft } from 'lucide-react';

const Interpretation = () => {
  const { catId } = useParams<{ catId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [animationPhase, setAnimationPhase] = useState<'initial' | 'hideHeader' | 'moveCards' | 'showText' | 'complete'>('initial');
  const [displayedText, setDisplayedText] = useState('');
  const [textComplete, setTextComplete] = useState(false);

  const cat = cats.find(c => c.id === catId);
  const question = location.state?.question || '';
  const cards = location.state?.cards || [];

  if (!cat) {
    return <div>Cat not found</div>;
  }

  // 根据卡牌的正逆位生成解读
  const generateInterpretation = () => {
    if (cards.length === 0) return '';
    
    const interpretations = cards.map((card: any, index: number) => {
      const positions = ['过去', '现在', '未来'];
      const meaning = card.isReversed ? card.reversedMeaning : card.uprightMeaning;
      const orientation = card.isReversed ? '逆位' : '正位';
      return `${positions[index]}的${card.name}(${orientation})：${meaning}`;
    });
    
    return `亲爱的，让我为你解读这三张牌的含义：\n\n${interpretations.join('\n\n')}\n\n这三张牌组合在一起，告诉我们你正在经历一个重要的人生阶段。过去的经历为你奠定了基础，现在的状态需要你仔细思考，而未来的道路充满了可能性。相信你的内在智慧，它会指引你找到正确的方向。`;
  };

  const interpretation = generateInterpretation();

  useEffect(() => {
    const timer1 = setTimeout(() => {
      setAnimationPhase('hideHeader');
    }, 300);

    const timer2 = setTimeout(() => {
      setAnimationPhase('moveCards');
    }, 800);

    const timer3 = setTimeout(() => {
      setAnimationPhase('showText');
      startTextAnimation();
    }, 1800);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  const startTextAnimation = () => {
    let index = 0;
    const interval = setInterval(() => {
      if (index < interpretation.length) {
        setDisplayedText(interpretation.slice(0, index + 1));
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
    navigate(`/chat/${catId}`, { 
      state: { 
        question,
        cards,
        interpretation
      } 
    });
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${cat.color} relative overflow-hidden`}>
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}></div>
      
      <div className="relative z-10 flex flex-col h-screen pb-40">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pt-12">
          <button 
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <div className="flex-1" />
        </div>

        {/* Cat Avatar and Title - 隐藏动画 */}
        <div className={`text-center px-6 mb-8 transition-all duration-500 ${
          animationPhase === 'hideHeader' || animationPhase === 'moveCards' || animationPhase === 'showText' || animationPhase === 'complete'
            ? 'opacity-0 -translate-y-4' 
            : 'opacity-100'
        }`}>
          <div className="w-32 h-32 mx-auto rounded-full overflow-hidden border-4 border-white/20 mb-4">
            <img 
              src={cat.avatar} 
              alt={cat.name}
              className="w-full h-full object-cover"
            />
          </div>
          <h2 className="text-white text-xl font-bold mb-2">你好呀，我是{cat.name}</h2>
          <h3 className="text-white text-xl font-bold">这是你抽到的牌</h3>
        </div>

        {/* Cards and Interpretation Container */}
        <div className="flex flex-col flex-1">
          {/* Cards container */}
          <div className={`flex justify-center space-x-2 px-4 w-full max-w-sm mx-auto transition-all duration-1000 ${
            animationPhase === 'moveCards' || animationPhase === 'showText' || animationPhase === 'complete'
              ? '-translate-y-64 mt-2'
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

          {/* Interpretation - 与塔罗牌同步移动 */}
          <div className={`px-6 mt-10 mb-4 transition-all duration-1000 ${
            animationPhase === 'showText' || animationPhase === 'complete'
              ? 'opacity-100' 
              : 'opacity-0 translate-y-8'
          } ${
            animationPhase === 'moveCards' || animationPhase === 'showText' || animationPhase === 'complete'
              ? '-translate-y-64'
              : 'translate-y-0'
          }`}>
            <div className="bg-white/10 rounded-2xl p-6 border border-white/20">
              <p className="text-white leading-relaxed text-sm text-center whitespace-pre-line">
                {displayedText}
                {!textComplete && animationPhase === 'showText' && <span className="animate-pulse">|</span>}
              </p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="fixed bottom-0 left-0 right-0 p-8 z-50 h-40 bg-gradient-to-t from-black/20 to-transparent">
          <button
            onClick={handleChatMore}
            className={`w-full bg-orange-500 hover:bg-orange-600 rounded-full py-6 text-white font-bold text-xl flex items-center justify-center space-x-3 border-4 border-orange-400 shadow-2xl transition-all duration-500 ${
              animationPhase === 'complete'
                ? 'opacity-100 translate-y-0' 
                : 'opacity-0 translate-y-4 pointer-events-none'
            }`}
          >
            <span>💬</span>
            <span>我想聊更多</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Interpretation;
