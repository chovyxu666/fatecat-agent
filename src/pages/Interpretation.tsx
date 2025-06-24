
import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { cats } from '../data/cats';
import { TarotCardComponent } from '../components/TarotCardComponent';
import { ChevronLeft } from 'lucide-react';

const Interpretation = () => {
  const { catId } = useParams<{ catId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [animationPhase, setAnimationPhase] = useState<'initial' | 'shrinking' | 'complete'>('initial');
  const [displayedText, setDisplayedText] = useState('');
  const [textComplete, setTextComplete] = useState(false);

  const cat = cats.find(c => c.id === catId);
  const question = location.state?.question || '';
  const cards = location.state?.cards || [];

  if (!cat) {
    return <div>Cat not found</div>;
  }

  const interpretation = `记住，不管前世是什么，今生的你都是如此独特而美好。就像森林里没有两片完全相同的叶子，你的灵魂故事也举世无双呢✨

这些牌会不会让你心里泛起一些涟漪？也许你已经隐约感觉到自己与某些动物的特殊联结了。如果愿意的话，可以和我聊聊你对哪种动物特别有亲切感呢～`;

  useEffect(() => {
    // 页面加载后开始动画序列
    const timer1 = setTimeout(() => {
      setAnimationPhase('shrinking');
    }, 500);

    const timer2 = setTimeout(() => {
      setAnimationPhase('complete');
      // 开始逐字显示文案
      startTextAnimation();
    }, 1500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
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
      }
    }, 50); // 每50ms显示一个字符
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
      
      <div className="relative z-10 flex flex-col h-screen">
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

        {/* Cat Avatar - 带有缩放动画 */}
        <div className="text-center px-6 mb-6">
          <div className={`mx-auto rounded-full overflow-hidden border-4 border-white/20 transition-all duration-1000 ${
            animationPhase === 'initial' 
              ? 'w-32 h-32' 
              : 'w-20 h-20'
          }`}>
            <img 
              src={cat.avatar} 
              alt={cat.name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Cards - 带有缩放动画 */}
        <div className="flex justify-center space-x-4 px-6 mb-6">
          {cards.map((card: any, index: number) => (
            <div 
              key={card.id}
              className={`transition-all duration-1000 ${
                animationPhase === 'initial' 
                  ? 'scale-125' 
                  : 'scale-100'
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <TarotCardComponent
                card={card}
                revealed={true}
                size="small"
              />
            </div>
          ))}
        </div>

        {/* Interpretation - 逐字显示 */}
        <div className="flex-1 px-6 mb-6">
          <div className={`bg-white/10 rounded-2xl p-6 border border-white/20 transition-all duration-500 ${
            animationPhase === 'complete' ? 'opacity-100' : 'opacity-0'
          }`}>
            <p className="text-white leading-relaxed text-sm whitespace-pre-line">
              {displayedText}
              {!textComplete && <span className="animate-pulse">|</span>}
            </p>
          </div>
        </div>

        {/* Action Button - 固定在底部，与之前按钮保持一致的高度 */}
        <div className="fixed bottom-0 left-0 right-0 p-6 z-50">
          <button
            onClick={handleChatMore}
            className={`w-full bg-orange-500 hover:bg-orange-600 rounded-full py-4 text-white font-bold text-lg flex items-center justify-center space-x-2 transition-all duration-500 ${
              textComplete 
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
