
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

        {/* Cat Avatar and Title */}
        <div className="text-center px-6 mb-6">
          <div className="w-20 h-20 mx-auto rounded-full overflow-hidden border-4 border-white/20 mb-3">
            <img
              src={cat.avatar}
              alt={cat.name}
              className="w-full h-full object-cover"
            />
          </div>
          <h2 className="text-white text-lg font-bold">{cat.name}的八字解读</h2>
        </div>

        <div className="flex-1 px-6 pb-6 space-y-6">
          {/* Bazi Chart */}
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-3xl p-6 shadow-2xl border border-yellow-200">
            <h3 className="text-center text-gray-800 font-bold text-lg mb-6">八字命盘</h3>
            
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
                <div className="w-14 h-18 bg-gradient-to-b from-gray-800 to-black rounded-lg flex flex-col items-center justify-center text-white text-xs shadow-lg">
                  <span className="text-red-400 font-bold">丙</span>
                  <span className="text-blue-400 font-bold">子</span>
                </div>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-14 h-18 bg-gradient-to-b from-gray-800 to-black rounded-lg flex flex-col items-center justify-center text-white text-xs shadow-lg">
                  <span className="text-blue-400 font-bold">癸</span>
                  <span className="text-red-400 font-bold">巳</span>
                </div>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-14 h-18 bg-gradient-to-b from-gray-800 to-black rounded-lg flex flex-col items-center justify-center text-white text-xs shadow-lg border-2 border-yellow-400">
                  <span className="text-green-400 font-bold">甲</span>
                  <span className="text-blue-400 font-bold">子</span>
                </div>
                <div className="text-xs text-yellow-600 font-bold mt-1">日主</div>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-14 h-18 bg-gradient-to-b from-gray-800 to-black rounded-lg flex flex-col items-center justify-center text-white text-xs shadow-lg">
                  <span className="text-green-400 font-bold">乙</span>
                  <span className="text-yellow-400 font-bold">丑</span>
                </div>
              </div>
            </div>
          </div>

          {/* Birth Info Display */}
          {birthInfo && (
            <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-6 shadow-2xl">
              <h3 className="text-gray-800 font-bold text-lg mb-4">出生信息</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">性别：</span>
                  <span className="text-gray-800 font-medium">{birthInfo.gender === 'male' ? '男' : '女'}</span>
                </div>
                <div>
                  <span className="text-gray-600">出生时间：</span>
                  <span className="text-gray-800 font-medium">
                    {birthInfo.year}/{birthInfo.month}/{birthInfo.day} {birthInfo.hour}:{birthInfo.minute}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-600">出生地点：</span>
                  <span className="text-gray-800 font-medium">
                    {birthInfo.province} {birthInfo.city} {birthInfo.district}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Interpretation */}
          <div className="bg-gradient-to-br from-purple-100/90 to-blue-100/90 backdrop-blur-sm rounded-3xl border border-purple-200 p-6 shadow-2xl">
            <h3 className="text-gray-800 font-bold text-lg mb-4 flex items-center">
              <span className="mr-2">🔮</span>
              {cat.name}的命理解读
            </h3>
            <div className="text-gray-700 leading-relaxed text-sm bg-white/50 rounded-2xl p-4">
              {interpretation}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-6 pb-8 space-y-4">
          <Button
            onClick={handleTodayFortune}
            className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-4 text-lg rounded-2xl flex items-center justify-center space-x-3 shadow-lg transform hover:scale-105 transition-all"
          >
            <span className="text-xl">📅</span>
            <span>今年运势</span>
          </Button>
          
          <Button
            onClick={handleLifeConsultation}
            className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-bold py-4 text-lg rounded-2xl flex items-center justify-center space-x-3 shadow-lg transform hover:scale-105 transition-all"
          >
            <span className="text-xl">🔮</span>
            <span>人生问事</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BaziResult;
