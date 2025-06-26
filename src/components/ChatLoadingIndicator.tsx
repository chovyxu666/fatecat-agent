
interface ChatLoadingIndicatorProps {
  catAvatar: string;
}

export const ChatLoadingIndicator = ({ catAvatar }: ChatLoadingIndicatorProps) => {
  return (
    <div className="flex justify-start">
      <div className="flex items-end space-x-2 max-w-[80%]">
        <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
          <img src={catAvatar} alt="Cat" className="w-full h-full object-cover" />
        </div>
        <div className="bg-white/10 border border-white/20 rounded-2xl px-4 py-3">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};
