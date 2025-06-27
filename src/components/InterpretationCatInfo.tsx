
import { Cat } from '../types';

interface InterpretationCatInfoProps {
  cat: Cat;
  animationPhase: string;
}

export const InterpretationCatInfo = ({ cat, animationPhase }: InterpretationCatInfoProps) => {
  return (
    <div className={`text-center px-6 mb-4 transition-all duration-500 ${
      animationPhase === 'hideHeader' || animationPhase === 'moveCards' || animationPhase === 'showText' || animationPhase === 'complete'
        ? 'opacity-0 -translate-y-4' 
        : 'opacity-100'
    }`}>
      <div className="w-24 h-24 mx-auto rounded-full overflow-hidden border-4 border-white/20 mb-3">
        <img 
          src={cat.avatar} 
          alt={cat.name}
          className="w-full h-full object-cover"
        />
      </div>
      <h2 className="text-white text-lg font-bold mb-1">你好呀，我是{cat.name}</h2>
      <h3 className="text-white text-lg font-bold">这是你抽到的牌</h3>
    </div>
  );
};
