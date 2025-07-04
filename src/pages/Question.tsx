
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { cats } from '../data/cats';
import { predefinedQuestions } from '../data/predefinedQuestions';
import { ChevronLeft } from 'lucide-react';
import { deleteHistory } from "../services/http"

const Question = () => {
  const {
    catId
  } = useParams<{
    catId: string;
  }>();
  const navigate = useNavigate();
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const cat = cats.find(c => c.id === catId);
  if (!cat) {
    return <div>Cat not found</div>;
  }

  const handleQuestionSelect = (selectedQuestion: string) => {
    console.log('Question selected:', selectedQuestion);
    setQuestion(selectedQuestion);
  };

  const handleSubmit = async () => {
    if (question.trim() && !isLoading) {
      setIsLoading(true);
      console.log('Navigating to cards page with question:', question.trim());

      // 先调用删除历史记录接口
      await deleteHistory();

      navigate(`/cards/${catId}`, {
        state: {
          question: question.trim()
        }
      });
      setIsLoading(false);
    } else {
      console.log('No question provided');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('Input changed:', e.target.value);
    setQuestion(e.target.value);
  };

  const handleInputFocus = () => {
    console.log('Input focused');
  };

  const handleButtonClick = () => {
    console.log('Button clicked, question:', question);
    handleSubmit();
  };

  return <div className={`min-h-screen bg-gradient-to-br ${cat.color} relative overflow-hidden`}>
    {/* Background pattern */}
    <div className="absolute inset-0 opacity-20 pointer-events-none" style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
    }}></div>

    <div className="relative z-10 min-h-screen pb-32">
      {/* Header */}
      <div className="flex items-center justify-between p-6 pt-12 relative z-20">
        <button onClick={() => navigate('/')} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>
        <div className="flex-1" />
      </div>

      {/* Cat Avatar and Intro */}
      <div className="text-center px-6 mb-8 relative z-20">
        <div className="w-32 h-32 mx-auto rounded-full overflow-hidden border-4 border-white/20 mb-4">
          <img src={cat.avatar} alt={cat.name} className="w-full h-full object-cover" />
        </div>
        <h2 className="text-white text-xl font-bold mb-2">你好呀，我是{cat.name}。</h2>
        <p className="text-white/80 text-sm leading-relaxed px-4">
          这里是你心灵的避风港，每一张牌都会像羽毛般轻轻托住你的困惑。慢慢诉说，我会陪你找到答案。
        </p>
      </div>

      {/* Predefined Questions */}
      <div className="px-6 mb-8 relative z-20">
        <div className="space-y-3">
          {predefinedQuestions.map((q, index) => <button key={index} onClick={() => handleQuestionSelect(q)} className="w-full text-left p-4 bg-white/10 rounded-xl border border-white/20 text-white/90 text-sm hover:bg-white/20 transition-all duration-200 cursor-pointer active:scale-95">
            {q}
          </button>)}
        </div>
      </div>
    </div>

    {/* Fixed Input Area - 确保最高层级 */}
    <div className="fixed bottom-0 left-0 right-0 p-6 bg-black/30 backdrop-blur-md border-t border-white/10 z-50">
      <div className="flex items-center space-x-3 max-w-md mx-auto">
        <input type="text" value={question} onChange={handleInputChange} onKeyPress={handleKeyPress} onFocus={handleInputFocus} placeholder="点击这里输入你的问题..." className="flex-1 bg-white/15 border border-white/30 rounded-full px-4 py-3 text-white placeholder-white/60 focus:outline-none focus:border-white/50 focus:ring-2 focus:ring-white/30 focus:bg-white/20 transition-all duration-200" autoComplete="off" />
        <button onClick={handleButtonClick} disabled={!question.trim() || isLoading} className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-500 disabled:opacity-50 rounded-full py-3 text-white font-medium transition-all duration-200 min-w-[100px] cursor-pointer active:scale-95 disabled:cursor-not-allowed px-[10px]">
          {isLoading ? '处理中...' : '开始占卜'}
        </button>
      </div>
    </div>
  </div>;
};

export default Question;
