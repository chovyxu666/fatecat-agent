
interface ChatInputProps {
  message: string;
  setMessage: (message: string) => void;
  onSendMessage: () => void;
  isLoading: boolean;
}

export const ChatInput = ({ message, setMessage, onSendMessage, isLoading }: ChatInputProps) => {
  return (
    <div className="relative z-10 p-6 bg-black/20 backdrop-blur-sm">
      <div className="flex items-center space-x-3">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && !isLoading && onSendMessage()}
          placeholder="请随意分享你的想法"
          disabled={isLoading}
          className="flex-1 bg-white/10 border border-white/20 rounded-full px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-white/40 disabled:opacity-50"
        />
        <button
          onClick={onSendMessage}
          disabled={!message.trim() || isLoading}
          className="w-12 h-12 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-500 rounded-full flex items-center justify-center transition-colors duration-200"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <span className="text-white">↑</span>
          )}
        </button>
      </div>
    </div>
  );
};
