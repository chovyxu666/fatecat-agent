
import { ChatMessage } from '../types';
import { ChatBubble } from './ChatBubble';
import { ChatLoadingIndicator } from './ChatLoadingIndicator';

interface ChatMessagesProps {
  messages: ChatMessage[];
  catAvatar: string;
  isLoading: boolean;
}

export const ChatMessages = ({ messages, catAvatar, isLoading }: ChatMessagesProps) => {
  return (
    <div className="relative z-10 flex-1 overflow-y-auto px-6 py-4 space-y-4">
      {messages.map(msg => 
        <ChatBubble 
          key={msg.id} 
          message={msg} 
          catAvatar={msg.sender === 'cat' ? catAvatar : undefined} 
        />
      )}
      {isLoading && <ChatLoadingIndicator catAvatar={catAvatar} />}
    </div>
  );
};
