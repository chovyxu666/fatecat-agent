
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { cats } from '../data/cats';
import { TarotCardComponent } from '../components/TarotCardComponent';
import { ChevronLeft } from 'lucide-react';

const Interpretation = () => {
  const { catId } = useParams<{ catId: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const cat = cats.find(c => c.id === catId);
  const question = location.state?.question || '';
  const cards = location.state?.cards || [];

  if (!cat) {
    return <div>Cat not found</div>;
  }

  const interpretation = `记住，不管前世是什么，今生的你都是如此独特而美好。就像森林里没有两片完全相同的叶子，你的灵魂故事也举世无双呢✨

这些牌会不会让你心里泛起一些涟漪？也许你已经隐约感觉到自己与某些动物的特殊联结了。如果愿意的话，可以和我聊聊你对哪种动物特别有亲切感呢～`;

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
            className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <div className="flex-1" />
        </div>

        {/* Cat Avatar */}
        <div className="text-center px-6 mb-6">
          <div className="w-20 h-20 mx-auto rounded-full overflow-hidden border-4 border-white/20">
            <img 
              src={cat.avatar} 
              alt={cat.name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Small Cards */}
        <div className="flex justify-center space-x-4 px-6 mb-6">
          {cards.map((card: any) => (
            <TarotCardComponent
              key={card.id}
              card={card}
              revealed={true}
              size="small"
            />
          ))}
        </div>

        {/* Interpretation */}
        <div className="flex-1 px-6 mb-6">
          <div className="bg-white/10 rounded-2xl p-6 border border-white/20">
            <p className="text-white leading-relaxed text-sm">
              {interpretation}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-6 space-y-3">
          <button
            onClick={handleChatMore}
            className="w-full bg-orange-500 hover:bg-orange-600 rounded-full py-4 text-white font-bold flex items-center justify-center space-x-2 transition-colors duration-200"
          >
            <span>💬</span>
            <span>我想聊更多</span>
          </button>
          <button
            className="w-full bg-white/10 hover:bg-white/20 border border-white/20 rounded-full py-4 text-white font-medium transition-colors duration-200"
          >
            📤 分享
          </button>
        </div>
      </div>
    </div>
  );
};

export default Interpretation;
