
import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { cats } from '../data/cats';
import { tarotCards } from '../data/tarotCards';
import { TarotCardComponent } from '../components/TarotCardComponent';
import { ChevronLeft } from 'lucide-react';

const Cards = () => {
  const { catId } = useParams<{ catId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [visibleCards, setVisibleCards] = useState<number[]>([]);
  const [animationComplete, setAnimationComplete] = useState(false);

  const cat = cats.find(c => c.id === catId);
  const question = location.state?.question || '';

  if (!cat) {
    return <div>Cat not found</div>;
  }

  useEffect(() => {
    // 依次显示三张牌的动画
    const showCard = (index: number) => {
      setTimeout(() => {
        setVisibleCards(prev => [...prev, index]);
        if (index === 2) {
          // 所有卡片都显示完成后，稍等一下再显示按钮
          setTimeout(() => {
            setAnimationComplete(true);
          }, 500);
        }
      }, index * 800); // 每张卡片间隔800ms出现
    };

    // 页面加载后开始动画
    setTimeout(() => {
      showCard(0);
      showCard(1);
      showCard(2);
    }, 1000);
  }, []);

  const handleContinue = () => {
    navigate(`/interpretation/${catId}`, { 
      state: { 
        question,
        cards: tarotCards 
      } 
    });
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${cat.color} relative overflow-hidden`}>
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}></div>
      
      <div className="relative z-10 flex flex-col min-h-screen pb-32">
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

        {/* Cat Avatar */}
        <div className="text-center px-6 mb-8">
          <div className="w-24 h-24 mx-auto rounded-full overflow-hidden border-4 border-white/20">
            <img 
              src={cat.avatar} 
              alt={cat.name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Cards Section */}
        <div className="flex-1 flex flex-col items-center justify-center px-4">
          <h2 className="text-white text-xl font-bold mb-8 text-center">
            这是你抽到的牌
          </h2>
          
          <div className="flex justify-center space-x-2 mb-8 w-full max-w-sm">
            {tarotCards.map((card, index) => (
              <div 
                key={card.id}
                className={`flex-1 transition-all duration-700 ${
                  visibleCards.includes(index) 
                    ? 'opacity-100 translate-y-0 scale-100' 
                    : 'opacity-0 translate-y-8 scale-95'
                }`}
              >
                <TarotCardComponent
                  card={card}
                  revealed={visibleCards.includes(index)}
                  size="medium"
                />
              </div>
            ))}
          </div>

          {/* Question Display */}
          <div className={`bg-white/10 rounded-xl p-4 mb-8 border border-white/20 transition-all duration-500 mx-4 ${
            animationComplete ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
            <p className="text-white/80 text-sm text-center">你的问题：</p>
            <p className="text-white text-center mt-1">{question}</p>
          </div>
        </div>
      </div>

      {/* Fixed Action Button - 与Question页面保持一致的位置 */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-black/30 backdrop-blur-md border-t border-white/10 z-50">
        <button
          onClick={handleContinue}
          className={`w-full bg-orange-500 hover:bg-orange-600 rounded-full py-4 text-white font-bold text-lg transition-all duration-500 ${
            animationComplete 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-4 pointer-events-none'
          }`}
        >
          开始解析
        </button>
      </div>
    </div>
  );
};

export default Cards;
