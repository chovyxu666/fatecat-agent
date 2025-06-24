
import { Cat } from '../types';

interface CatCardProps {
  cat: Cat;
  onClick: () => void;
}

export const CatCard = ({ cat, onClick }: CatCardProps) => {
  return (
    <div 
      onClick={onClick}
      className={`relative bg-gradient-to-br ${cat.color} rounded-2xl p-6 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl border border-white/10`}
    >
      <div className="flex items-center space-x-4">
        <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white/20">
          <img 
            src={cat.avatar} 
            alt={cat.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1">
          <h3 className="text-white font-bold text-lg">{cat.name}</h3>
          <p className="text-white/80 text-sm">{cat.breed}</p>
          <div className="flex items-center space-x-2 mt-2">
            <span className="bg-white/20 text-white text-xs px-2 py-1 rounded-full">
              {cat.specialty}
            </span>
            <span className="bg-white/20 text-white text-xs px-2 py-1 rounded-full">
              {cat.personality}
            </span>
          </div>
        </div>
      </div>
      <p className="text-white/70 text-sm mt-4 leading-relaxed">
        {cat.description}
      </p>
    </div>
  );
};
