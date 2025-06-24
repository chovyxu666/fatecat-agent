
import { useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { cats } from '../data/cats';
import { ChatBubble } from '../components/ChatBubble';
import { ChatMessage } from '../types';
import { ChevronLeft } from 'lucide-react';

const Chat = () => {
  const { catId } = useParams<{ catId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      text: location.state?.interpretation || '感谢你的提问，如果你还有什么想了解的，请随时告诉我。',
      sender: 'cat',
      timestamp: new Date()
    }
  ]);

  const cat = cats.find(c => c.id === catId);

  if (!cat) {
    return <div>Cat not found</div>;
  }

  const handleSendMessage = () => {
    if (!message.trim()) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: message.trim(),
      sender: 'user',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setMessage('');

    // Simulate cat response
    setTimeout(() => {
      const catResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: `亲爱的朋友，我能感受到你的一丝不安呢 😊 其实牌面没有绝对的好坏之分，它们只是像镜子一样，帮你更清晰地看见自己。

就像花园里同时需要阳光和雨水，生命中的每一段经历都在滋养你成长呢～ 🌱`,
        sender: 'cat',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, catResponse]);
    }, 1000);
  };

  return (
    <div className={`h-screen bg-gradient-to-br ${cat.color} relative overflow-hidden flex flex-col`}>
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}></div>
      
      {/* Header */}
      <div className="relative z-10 flex items-center justify-between p-6 pt-12 bg-black/10 backdrop-blur-sm">
        <button 
          onClick={() => navigate('/')} 
          className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center"
        >
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>
        <div className="flex-1 text-center">
          <p className="text-white font-bold text-lg">{cat.name}</p>
        </div>
        <div className="w-10" />
      </div>

      {/* Chat Messages */}
      <div className="relative z-10 flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.map(msg => 
          <ChatBubble 
            key={msg.id} 
            message={msg} 
            catAvatar={msg.sender === 'cat' ? cat.avatar : undefined} 
          />
        )}
      </div>

      {/* Input Area */}
      <div className="relative z-10 p-6 bg-black/20 backdrop-blur-sm">
        <div className="flex items-center space-x-3">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="请随意分享你的想法"
            className="flex-1 bg-white/10 border border-white/20 rounded-full px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-white/40"
          />
          <button
            onClick={handleSendMessage}
            disabled={!message.trim()}
            className="w-12 h-12 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-500 rounded-full flex items-center justify-center transition-colors duration-200"
          >
            <span className="text-white">↑</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
