
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Cat } from '../types';

interface ChatHeaderProps {
  cat: Cat;
}

export const ChatHeader = ({ cat }: ChatHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className="relative z-10 flex items-center justify-between p-6 pt-12 bg-black/10 backdrop-blur-sm">
      <button 
        onClick={() => navigate('/')} 
        className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center"
      >
        <ChevronLeft className="w-6 h-6 text-white" />
      </button>
      <div className="flex-1 text-center">
        <p className="text-white font-bold text-lg">{cat.name}</p>
      </div>
      <div className="w-10" />
    </div>
  );
};
