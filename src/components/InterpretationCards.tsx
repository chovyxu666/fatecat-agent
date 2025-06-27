
import { TarotCardComponent } from './TarotCardComponent';

interface InterpretationCardsProps {
  cards: any[];
  animationPhase: string;
}

export const InterpretationCards = ({ cards, animationPhase }: InterpretationCardsProps) => {
  return (
    <div className={`flex justify-center space-x-2 px-4 w-full max-w-sm mx-auto transition-all duration-1000 ${
      animationPhase === 'moveCards' || animationPhase === 'showText' || animationPhase === 'complete'
        ? '-translate-y-32 mt-2'
        : 'translate-y-0'
    }`}>
      {cards.map((card: any, index: number) => (
        <div key={card.id} className="flex-1">
          <TarotCardComponent
            card={card}
            revealed={true}
            size="medium"
          />
        </div>
      ))}
    </div>
  );
};
