
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface InterpretationHeaderProps {
  // No specific props needed as it's just a back button
}

export const InterpretationHeader = () => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between p-4 pt-8">
      <button 
        onClick={() => navigate(-1)}
        className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
      >
        <ChevronLeft className="w-6 h-6 text-white" />
      </button>
      <div className="flex-1" />
    </div>
  );
};
