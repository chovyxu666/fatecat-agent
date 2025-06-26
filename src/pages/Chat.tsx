
import { useParams } from 'react-router-dom';
import { cats } from '../data/cats';
import { ChatHeader } from '../components/ChatHeader';
import { ChatMessages } from '../components/ChatMessages';
import { ChatInput } from '../components/ChatInput';
import { useChat } from '../hooks/useChat';

const Chat = () => {
  const { catId } = useParams<{ catId: string }>();
  const cat = cats.find(c => c.id === catId);
  
  const {
    message,
    setMessage,
    messages,
    isLoading,
    handleSendMessage
  } = useChat(catId);

  if (!cat) {
    return <div>Cat not found</div>;
  }

  return (
    <div className={`h-screen bg-gradient-to-br ${cat.color} relative overflow-hidden flex flex-col`}>
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}></div>
      
      <ChatHeader cat={cat} />
      <ChatMessages 
        messages={messages} 
        catAvatar={cat.avatar} 
        isLoading={isLoading} 
      />
      <ChatInput 
        message={message}
        setMessage={setMessage}
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
      />
    </div>
  );
};

export default Chat;
