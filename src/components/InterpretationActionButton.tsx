
interface InterpretationActionButtonProps {
  animationPhase: string;
  isLoading: boolean;
  interpretationMessages: string[];
  currentStreamText: string;
  onChatMore: () => void;
}

export const InterpretationActionButton = ({
  animationPhase,
  isLoading,
  interpretationMessages,
  currentStreamText,
  onChatMore
}: InterpretationActionButtonProps) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 z-50 bg-gradient-to-t from-black/20 to-transparent">
      <button
        onClick={onChatMore}
        disabled={isLoading || (interpretationMessages.length === 0 && !currentStreamText)}
        className={`w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-500 disabled:cursor-not-allowed rounded-full py-3 text-white font-bold text-lg flex items-center justify-center space-x-3 border-4 border-orange-400 shadow-2xl transition-all duration-500 ${
          animationPhase === 'complete' && !isLoading && (interpretationMessages.length > 0 || currentStreamText)
            ? 'opacity-100 translate-y-0' 
            : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
      >
        <span>💬</span>
        <span>我想聊更多</span>
      </button>
    </div>
  );
};
