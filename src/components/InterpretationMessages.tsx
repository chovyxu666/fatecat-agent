
interface InterpretationMessagesProps {
  animationPhase: string;
  isLoading: boolean;
  currentStreamText: string;
  displayedMessages: string[];
  currentDisplayIndex: number;
  isTyping: boolean;
}

export const InterpretationMessages = ({
  animationPhase,
  isLoading,
  currentStreamText,
  displayedMessages,
  currentDisplayIndex,
  isTyping
}: InterpretationMessagesProps) => {
  return (
    <div className={`px-6 mt-4 transition-all duration-1000 ${
      animationPhase === 'showText' || animationPhase === 'complete'
        ? 'opacity-100' 
        : 'opacity-0 translate-y-8'
    } ${
      animationPhase === 'moveCards' || animationPhase === 'showText' || animationPhase === 'complete'
        ? '-translate-y-32'
        : 'translate-y-0'
    }`}>
      {isLoading ? (
        <div className="bg-white/10 rounded-2xl border border-white/20 p-4">
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span className="ml-3 text-white text-sm">正在为你解读...</span>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <div className="flex space-x-4 pb-2">
            {/* 显示已完成的消息 */}
            {displayedMessages.map((message, index) => {
              if (!message && index > currentDisplayIndex) return null;
              
              return (
                <div key={index} className="flex-shrink-0 w-72">
                  <div className="bg-white/10 rounded-2xl border border-white/20 p-4 min-h-20">
                    <p className="text-white leading-relaxed text-sm text-center whitespace-pre-line">
                      {message}
                      {index === currentDisplayIndex && isTyping && 
                        <span className="animate-pulse">|</span>
                      }
                    </p>
                  </div>
                </div>
              );
            })}
            
            {/* 显示当前流式文本（仅在加载时） */}
            {currentStreamText.trim() && isLoading && (
              <div className="flex-shrink-0 w-72">
                <div className="bg-white/10 rounded-2xl border border-white/20 p-4 min-h-20">
                  <p className="text-white leading-relaxed text-sm text-center whitespace-pre-line">
                    {currentStreamText}
                    <span className="animate-pulse">|</span>
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
