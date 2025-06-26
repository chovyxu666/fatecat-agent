
import { useState, useRef, useEffect } from 'react';
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
  const [isLoading, setIsLoading] = useState(false);
  const [isFirstMessage, setIsFirstMessage] = useState(true);
  const abortControllerRef = useRef<AbortController | null>(null);

  const cat = cats.find(c => c.id === catId);
  const cards = location.state?.cards || [];

  if (!cat) {
    return <div>Cat not found</div>;
  }

  // 格式化塔罗牌信息
  const formatTarotCards = () => {
    if (cards.length === 0) return '';
    
    const positions = ['过去', '现在', '未来'];
    const cardDescriptions = cards.map((card: any, index: number) => {
      const orientation = card.isReversed ? '逆位' : '正位';
      return `${positions[index]}：${card.name}（${orientation}）`;
    });
    
    return cardDescriptions.join('\\n');
  };

  const handleStreamResponse = async (response: Response, userMessageId: string) => {
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    
    if (!reader) {
      throw new Error('无法读取响应流');
    }

    // 创建猫咪回复消息
    const catMessageId = (Date.now() + 1).toString();
    const catMessage: ChatMessage = {
      id: catMessageId,
      text: '',
      sender: 'cat',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, catMessage]);

    try {
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const jsonStr = line.substring(6).trim();
              if (jsonStr) {
                const data = JSON.parse(jsonStr);
                if (data.chunk) {
                  setMessages(prev => 
                    prev.map(msg => 
                      msg.id === catMessageId 
                        ? { ...msg, text: msg.text + data.chunk }
                        : msg
                    )
                  );
                }
              }
            } catch (e) {
              console.log('解析JSON失败:', e);
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: message.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentMessage = message.trim();
    setMessage('');
    setIsLoading(true);

    // 取消之前的请求
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    try {
      const requestBody: any = {
        user_id: "123",
        message: currentMessage
      };

      // 第一次发送消息时包含塔罗牌信息
      if (isFirstMessage) {
        requestBody.tarot = formatTarotCards();
        setIsFirstMessage(false);
      }

      const response = await fetch('http://192.168.124.212:5000/chat/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      await handleStreamResponse(response, userMessage.id);

    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('请求被取消');
        return;
      }
      
      console.error('发送消息失败:', error);
      
      // 添加错误消息
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: '抱歉，我现在无法回复你。请稍后再试。',
        sender: 'cat',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

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
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex items-end space-x-2 max-w-[80%]">
              <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                <img src={cat.avatar} alt="Cat" className="w-full h-full object-cover" />
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
        )}
      </div>

      {/* Input Area */}
      <div className="relative z-10 p-6 bg-black/20 backdrop-blur-sm">
        <div className="flex items-center space-x-3">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSendMessage()}
            placeholder="请随意分享你的想法"
            disabled={isLoading}
            className="flex-1 bg-white/10 border border-white/20 rounded-full px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-white/40 disabled:opacity-50"
          />
          <button
            onClick={handleSendMessage}
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
    </div>
  );
};

export default Chat;
