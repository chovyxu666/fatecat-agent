
import { TarotCard } from '../types';

interface TarotCardComponentProps {
  card: TarotCard;
  revealed?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export const TarotCardComponent = ({ card, revealed = true, size = 'medium' }: TarotCardComponentProps) => {
  const sizeClasses = {
    small: 'w-16 h-28',
    medium: 'w-20 h-32',
    large: 'w-24 h-40'
  };

  const positionLabels = {
    past: '过去',
    present: '现在',
    future: '未来'
  };

  return (
    <div className="flex flex-col items-center space-y-2">
      <div className={`${sizeClasses[size]} relative`}>
        {revealed ? (
          <img 
            src={card.image} 
            alt={card.name}
            className="w-full h-full object-cover rounded-lg border border-white/20 shadow-lg"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-purple-900 to-indigo-900 rounded-lg border border-white/20 shadow-lg flex items-center justify-center">
            <div className="text-white/50 text-xs">?</div>
          </div>
        )}
      </div>
      <div className="text-center">
        <p className="text-white/80 text-xs font-medium">
          {positionLabels[card.position]}
        </p>
        {revealed && (
          <p className="text-white/60 text-xs mt-1">{card.name}</p>
        )}
      </div>
    </div>
  );
};
