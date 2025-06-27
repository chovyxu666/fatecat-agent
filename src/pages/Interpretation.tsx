
import { useParams } from 'react-router-dom';
import { cats } from '../data/cats';
import { InterpretationHeader } from '../components/InterpretationHeader';
import { InterpretationCatInfo } from '../components/InterpretationCatInfo';
import { InterpretationCards } from '../components/InterpretationCards';
import { InterpretationMessages } from '../components/InterpretationMessages';
import { InterpretationActionButton } from '../components/InterpretationActionButton';
import { useInterpretation } from '../hooks/useInterpretation';

const Interpretation = () => {
  const { catId } = useParams<{ catId: string }>();
  const cat = cats.find(c => c.id === catId);

  const {
    animationPhase,
    interpretationMessages,
    currentStreamText,
    isLoading,
    displayedMessages,
    currentDisplayIndex,
    isTyping,
    handleChatMore,
    cards
  } = useInterpretation(catId);

  if (!cat) {
    return <div>Cat not found</div>;
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br ${cat.color} relative overflow-auto`}>
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}></div>
      
      <div className="relative z-10 flex flex-col pb-20">
        <InterpretationHeader />
        
        <InterpretationCatInfo cat={cat} animationPhase={animationPhase} />

        {/* Cards and Interpretation Container */}
        <div className="flex flex-col">
          <InterpretationCards cards={cards} animationPhase={animationPhase} />
          
          <InterpretationMessages
            animationPhase={animationPhase}
            isLoading={isLoading}
            currentStreamText={currentStreamText}
            displayedMessages={displayedMessages}
            currentDisplayIndex={currentDisplayIndex}
            isTyping={isTyping}
          />
        </div>
      </div>

      <InterpretationActionButton
        animationPhase={animationPhase}
        isLoading={isLoading}
        interpretationMessages={interpretationMessages}
        currentStreamText={currentStreamText}
        onChatMore={handleChatMore}
      />
    </div>
  );
};

export default Interpretation;
