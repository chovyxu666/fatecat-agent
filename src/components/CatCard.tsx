
import { Cat } from '../types';

interface CatCardProps {
  cat: Cat;
  onClick: () => void;
  disabled?: boolean;
}

export const CatCard = ({ cat, onClick, disabled = false }: CatCardProps) => {
  return (
    <div 
      onClick={disabled ? undefined : onClick}
      className={`relative bg-gradient-to-br ${cat.color} rounded-2xl p-6 transform transition-all duration-300 border border-white/10 backdrop-blur-sm ${
        disabled 
          ? 'opacity-50 cursor-not-allowed' 
          : 'cursor-pointer hover:scale-105 hover:shadow-2xl'
      }`}
    >
      {/* 添加装饰性光效 */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/5 to-transparent rounded-2xl"></div>
      <div className="absolute top-4 right-4 w-16 h-16 bg-white/5 rounded-full blur-xl"></div>
      
      <div className="relative flex items-center space-x-4">
        <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white/30 shadow-lg">
          <img 
            src={cat.avatar} 
            alt={cat.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1">
          <h3 className="text-white font-bold text-lg mb-1">{cat.name}</h3>
          <div className="flex items-center space-x-2 mt-2">
            <span className="bg-white/20 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full border border-white/10">
              {cat.specialty}
            </span>
            <span className="bg-white/20 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full border border-white/10">
              {cat.personality}
            </span>
          </div>
        </div>
      </div>
      <p className="relative text-white/80 text-sm mt-4 leading-relaxed">
        {cat.description}
        {disabled && (
          <span className="block text-white/60 text-xs mt-2">即将开放</span>
        )}
      </p>
    </div>
  );
};
