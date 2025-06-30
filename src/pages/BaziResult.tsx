
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { cats } from '../data/cats';
import { ChevronLeft } from 'lucide-react';
import { Button } from '../components/ui/button';

const BaziResult = () => {
  const { catId } = useParams<{ catId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  
  const cat = cats.find(c => c.id === catId);
  const birthInfo = location.state?.birthInfo;

  if (!cat) {
    return <div>Cat not found</div>;
  }

  // 示例八字数据 - 实际应用中应该根据出生信息计算
  const baziData = {
    year: { tiangan: '食神', dizhi: '正印', element: '丙子', color: 'text-red-500' },
    month: { tiangan: '劫财', dizhi: '元男', element: '癸巳', color: 'text-blue-500' },
    day: { tiangan: '主星', dizhi: '甲子', element: '甲子', color: 'text-green-500' },
    hour: { tiangan: '劫财', dizhi: '乙丑', element: '乙丑', color: 'text-green-500' }
  };

  const interpretation = `嗨，凡人听好了，本小玄已经看穿你的命盘了！你是"甲子"日出生的，就像一棵长在水边的聪明大树，天生就带着贵气。你命里有"正印"和"食神"这两颗吉星照着，说明你脑子灵光，品味不俗，能把学到的东西变成闪闪发光的点子。不过本喵可要提醒你，你命里有个叫"劫财"的捣蛋鬼，所以交朋友和管小金干......哦不，是管钱的时候，一定要睁大眼睛，小心被别人占了便宜！等你学会了怎么保护好自己的宝贝，你就能成为最受尊敬的那棵参天大树，要谨记啊！`;

  const handleTodayFortune = () => {
    navigate(`/chat/${catId}`, {
      state: {
        question: '今日运势',
        initialMessages: [{
          id: `fortune_${Date.now()}`,
          text: '我想了解今天的运势如何，请帮我分析一下。',
          sender: 'user' as const,
          timestamp: new Date()
        }]
      }
    });
  };

  const handleLifeConsultation = () => {
    navigate(`/chat/${catId}`, {
      state: {
        question: '人生问事',
        initialMessages: [{
          id: `life_${Date.now()}`,
          text: '我想咨询一些人生问题，请为我指点迷津。',
          sender: 'user' as const,
          timestamp: new Date()
        }]
      }
    });
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${cat.color} relative`}>
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}></div>

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header */}
        <div className="flex items-center justify-between p-4 pt-8">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <div className="flex-1" />
        </div>

        <div className="flex-1 px-6 pb-6 space-y-6">
          {/* Bazi Chart */}
          <div className="bg-gradient-to-r from-yellow-100 to-yellow-200 rounded-2xl p-4">
            <div className="grid grid-cols-5 gap-2 text-center text-sm font-medium mb-4">
              <div className="text-gray-700">日期</div>
              <div className="text-gray-700">年柱</div>
              <div className="text-gray-700">月柱</div>
              <div className="text-gray-700">日柱</div>
              <div className="text-gray-700">时柱</div>
            </div>
            
            <div className="grid grid-cols-5 gap-2 text-center text-sm mb-4">
              <div className="text-gray-700 font-medium">主星</div>
              <div className="text-gray-700">{baziData.year.tiangan}</div>
              <div className="text-gray-700">{baziData.month.tiangan}</div>
              <div className="text-gray-700">{baziData.day.tiangan}</div>
              <div className="text-gray-700">{baziData.hour.tiangan}</div>
            </div>

            <div className="grid grid-cols-5 gap-2 mb-4">
              <div className="text-center text-gray-700 font-medium">天干<br/>地支</div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-16 bg-black rounded-lg flex flex-col items-center justify-center text-white text-xs">
                  <span className="text-red-400">丙</span>
                  <span className="text-blue-400">子</span>
                </div>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-16 bg-black rounded-lg flex flex-col items-center justify-center text-white text-xs">
                  <span className="text-blue-400">癸</span>
                  <span className="text-red-400">巳</span>
                </div>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-16 bg-black rounded-lg flex flex-col items-center justify-center text-white text-xs">
                  <span className="text-green-400">甲</span>
                  <span className="text-blue-400">子</span>
                </div>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-16 bg-black rounded-lg flex flex-col items-center justify-center text-white text-xs">
                  <span className="text-green-400">乙</span>
                  <span className="text-yellow-400">丑</span>
                </div>
              </div>
            </div>
          </div>

          {/* Interpretation */}
          <div className="bg-white/10 rounded-2xl border border-white/20 p-6">
            <div className="text-white leading-relaxed text-sm">
              {interpretation}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-6 pb-8 space-y-4">
          <Button
            onClick={handleTodayFortune}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 text-lg rounded-full flex items-center justify-center space-x-2"
          >
            <span>📅</span>
            <span>今年运势</span>
          </Button>
          
          <Button
            onClick={handleLifeConsultation}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 text-lg rounded-full flex items-center justify-center space-x-2"
          >
            <span>🔮</span>
            <span>人生问事</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BaziResult;
