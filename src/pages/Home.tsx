
import { cats } from '../data/cats';
import { CatCard } from '../components/CatCard';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  const handleCatSelect = (catId: string) => {
    navigate(`/question/${catId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}></div>
      
      <div className="relative z-10 p-6 pt-12">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">选择塔罗师</h1>
          <p className="text-white/70 text-sm">每位塔罗师风格不同...</p>
        </div>

        {/* Cat Cards */}
        <div className="space-y-4">
          {cats.map((cat) => (
            <CatCard 
              key={cat.id} 
              cat={cat} 
              onClick={() => handleCatSelect(cat.id)}
            />
          ))}
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-white/50 text-xs">
          ✨ 让神秘的力量指引你前行 ✨
        </div>
      </div>
    </div>
  );
};

export default Home;
