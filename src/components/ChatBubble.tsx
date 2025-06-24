
import { ChatMessage } from '../types';

interface ChatBubbleProps {
  message: ChatMessage;
  catAvatar?: string;
}

export const ChatBubble = ({ message, catAvatar }: ChatBubbleProps) => {
  const isUser = message.sender === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`flex items-end space-x-2 max-w-[80%] ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
        {!isUser && catAvatar && (
          <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
            <img src={catAvatar} alt="Cat" className="w-full h-full object-cover" />
          </div>
        )}
        <div 
          className={`rounded-2xl px-4 py-3 ${
            isUser 
              ? 'bg-purple-600 text-white' 
              : 'bg-white/10 text-white border border-white/20'
          }`}
        >
          <p className="text-sm leading-relaxed">{message.text}</p>
        </div>
      </div>
    </div>
  );
};
