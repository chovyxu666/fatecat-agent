
import { cats } from '../data/cats';
import { CatCard } from '../components/CatCard';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  const handleCatSelect = (catId: string) => {
    // 只有Tara可以点击
    if (catId === 'siamese') {
      navigate(`/question/${catId}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 relative overflow-hidden">
      {/* Multi-layer background effects */}
      <div className="absolute inset-0 opacity-20">
        <svg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <defs>
            <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <circle cx="30" cy="30" r="2" fill="white" fillOpacity="0.03"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)"/>
        </svg>
      </div>
      
      {/* Decorative light effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
      <div className="absolute top-1/2 left-0 w-64 h-64 bg-violet-500/10 rounded-full blur-2xl"></div>
      
      <div className="relative z-10 p-6 pt-12">
        {/* Header - removed glass effects */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
            选择占卜师
          </h1>
          <p className="text-white/70 text-sm">每只猫咪拥有独特的风格和占卜技巧</p>
        </div>

        {/* Cat Cards */}
        <div className="space-y-6 max-w-md mx-auto">
          {cats.map((cat, index) => (
            <div 
              key={cat.id} 
              className="animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CatCard 
                cat={cat} 
                onClick={() => handleCatSelect(cat.id)}
                disabled={cat.id !== 'siamese'}
              />
            </div>
          ))}
        </div>

        {/* Footer - removed glass effects */}
        <div className="text-center mt-12">
          <p className="text-white/60 text-xs flex items-center justify-center space-x-2">
            <span>✨</span>
            <span>让喵星人为你解开迷雾</span>
            <span>✨</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;
