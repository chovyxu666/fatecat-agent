
import { useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { cats } from '../data/cats';
import { tarotCards } from '../data/tarotCards';
import { TarotCardComponent } from '../components/TarotCardComponent';
import { ChevronLeft } from 'lucide-react';

const Cards = () => {
  const { catId } = useParams<{ catId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [cardsRevealed, setCardsRevealed] = useState(false);

  const cat = cats.find(c => c.id === catId);
  const question = location.state?.question || '';

  if (!cat) {
    return <div>Cat not found</div>;
  }

  const handleRevealCards = () => {
    setCardsRevealed(true);
    // Add some delay before navigating to interpretation
    setTimeout(() => {
      navigate(`/interpretation/${catId}`, { 
        state: { 
          question,
          cards: tarotCards 
        } 
      });
    }, 2000);
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${cat.color} relative overflow-hidden`}>
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.03"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
      
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
        <div className="flex-1 flex flex-col items-center justify-center px-6">
          <h2 className="text-white text-xl font-bold mb-8 text-center">
            这是你抽到的牌
          </h2>
          
          <div className="flex justify-center space-x-6 mb-8">
            {tarotCards.map((card) => (
              <TarotCardComponent
                key={card.id}
                card={card}
                revealed={cardsRevealed}
                size="large"
              />
            ))}
          </div>

          {/* Question Display */}
          <div className="bg-white/10 rounded-xl p-4 mb-8 border border-white/20">
            <p className="text-white/80 text-sm text-center">你的问题：</p>
            <p className="text-white text-center mt-1">{question}</p>
          </div>
        </div>

        {/* Action Button */}
        <div className="p-6">
          <button
            onClick={handleRevealCards}
            className="w-full bg-orange-500 hover:bg-orange-600 rounded-full py-4 text-white font-bold text-lg transition-colors duration-200"
          >
            继续
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cards;
