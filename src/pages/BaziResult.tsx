import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { cats } from '../data/cats';
import { ChevronLeft } from 'lucide-react';
import { Button } from '../components/ui/button';
import { getBaZiResult } from "../services/http";
import { ChatService, ProcessedMessage } from '../services/chatService';
import { getUserId } from '../utils/userIdUtils';

interface BaziApiResponse {
  "主星": string[];
  "八字排盘": {
    "年柱": string;
    "月柱": string;
    "日柱": string;
    "时柱": string;
  };
  "年柱副星": string[];
  "年柱藏干": string[];
  "性别": string;
  "日柱副星": string[];
  "日柱藏干": string[];
  "时柱副星": string[];
  "时柱藏干": string[];
  "月柱副星": string[];
  "月柱藏干": string[];
}

const BaziResult = () => {
  const { catId } = useParams<{ catId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [baziData, setBaziData] = useState<BaziApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [interpretation, setInterpretation] = useState<string>('');
  const [isLoadingInterpretation, setIsLoadingInterpretation] = useState(false);

  const cat = cats.find(c => c.id === catId);
  const birthInfo = location.state?.birthInfo;

  if (!cat) {
    return <div>Cat not found</div>;
  }

  useEffect(() => {
    const fetchBaziData = async () => {
      try {
        setIsLoading(true);
        const response = await getBaZiResult({
          district_provincial: birthInfo.province,
          district_county: birthInfo.district,
          district_city: birthInfo.city,
          sex: birthInfo.gender === 'male' ? '男' : '女',
          date_type: birthInfo.calendarType === 'solar' ? '1' : '2',
          date_time: `${birthInfo.year}-${birthInfo.month}-${birthInfo.day} ${birthInfo.hour}:${birthInfo.minute}:00`
        });
        setBaziData(response.data);
      } catch (error) {
        console.error('获取八字数据失败:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (birthInfo) {
      fetchBaziData();
    }
  }, [birthInfo]);

  const fetchBaziInterpretation = async () => {
    const chatService = new ChatService();

    try {
      let interpretationText = '';
      const handleInterpretationMessage = (processedMessage: ProcessedMessage) => {
        if (processedMessage.isComplete) {
          interpretationText += processedMessage.text + '\n';
        }
        setInterpretation(interpretationText + processedMessage.text);
        setIsLoadingInterpretation(false);

      };

      await chatService.sendMessage(
        {
          user_id: getUserId('bazi'),
          message: '请解读我的八字命盘',
          chat_type: 1
        },
        handleInterpretationMessage,
        undefined,
        true
      );
    } catch (error) {
      console.error('获取八字解读失败:', error);
      setInterpretation('八字解读暂时无法获取，请稍后重试。');
    } finally {
      setIsLoadingInterpretation(true);
    }
  };

  useEffect(() => {
    if (baziData && !interpretation) {
      fetchBaziInterpretation();
    }
  }, [baziData]);

  const parseBaziPan = (baziPan: BaziApiResponse["八字排盘"]) => {
    const parseColumn = (columnStr: string) => {
      // 格式: "乙亥 (木水)" -> {tiangan: "乙", dizhi: "亥", element: "木水"}
      const match = columnStr.match(/^(.)(.) \((.+)\)$/);
      if (match) {
        return {
          tiangan: match[1],
          dizhi: match[2],
          element: match[3]
        };
      }
      return { tiangan: '', dizhi: '', element: '' };
    };

    return {
      year: parseColumn(baziPan.年柱),
      month: parseColumn(baziPan.月柱),
      day: parseColumn(baziPan.日柱),
      hour: parseColumn(baziPan.时柱)
    };
  };

  const getTianganColor = (tiangan: string) => {
    const colors: { [key: string]: string } = {
      '甲': 'text-green-400', '乙': 'text-green-400',
      '丙': 'text-red-400', '丁': 'text-red-400',
      '戊': 'text-yellow-400', '己': 'text-yellow-400',
      '庚': 'text-gray-400', '辛': 'text-gray-400',
      '壬': 'text-blue-400', '癸': 'text-blue-400'
    };
    return colors[tiangan] || 'text-white';
  };

  const getDizhiColor = (dizhi: string) => {
    const colors: { [key: string]: string } = {
      '子': 'text-blue-400', '丑': 'text-yellow-400', '寅': 'text-green-400',
      '卯': 'text-green-400', '辰': 'text-yellow-400', '巳': 'text-red-400',
      '午': 'text-red-400', '未': 'text-yellow-400', '申': 'text-gray-400',
      '酉': 'text-gray-400', '戌': 'text-yellow-400', '亥': 'text-blue-400'
    };
    return colors[dizhi] || 'text-white';
  };

  const handleTodayFortune = () => {
    navigate(`/chat/${catId}`, {
      state: {
        question: '今年运势',
        chatType: 2,
        initialMessages: [{
          id: `fortune_${Date.now()}`,
          text: '我想了解今年的运势如何，请帮我分析一下。',
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
        chatType: 3,
        initialMessages: [{
          id: `life_${Date.now()}`,
          text: '我想咨询一些人生问题，请为我指点迷津。',
          sender: 'user' as const,
          timestamp: new Date()
        }]
      }
    });
  };

  if (isLoading) {
    return (
      <div className={`min-h-screen bg-gradient-to-br ${cat.color} flex items-center justify-center`}>
        <div className="text-white text-lg">正在解析八字...</div>
      </div>
    );
  }

  if (!baziData) {
    return (
      <div className={`min-h-screen bg-gradient-to-br ${cat.color} flex items-center justify-center`}>
        <div className="text-white text-lg">八字数据加载失败</div>
      </div>
    );
  }

  const parsedBazi = parseBaziPan(baziData.八字排盘);

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
          {/* Bazi Chart with real data */}
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
              <div className="text-gray-700">{baziData.主星[0]}</div>
              <div className="text-gray-700">{baziData.主星[1]}</div>
              <div className="text-gray-700">{baziData.主星[2]}</div>
              <div className="text-gray-700">{baziData.主星[3]}</div>
            </div>

            <div className="grid grid-cols-5 gap-2 mb-4">
              <div className="text-center text-gray-700 font-medium flex items-center justify-center">
                <div className="text-xs leading-tight">天干<br />地支</div>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-14 h-20 bg-gradient-to-b from-gray-800 to-black rounded-lg flex flex-col items-center justify-center text-white text-sm shadow-lg">
                  <span className={`font-bold text-base ${getTianganColor(parsedBazi.year.tiangan)}`}>{parsedBazi.year.tiangan}</span>
                  <span className={`font-bold text-base ${getDizhiColor(parsedBazi.year.dizhi)}`}>{parsedBazi.year.dizhi}</span>
                </div>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-14 h-20 bg-gradient-to-b from-gray-800 to-black rounded-lg flex flex-col items-center justify-center text-white text-sm shadow-lg">
                  <span className={`font-bold text-base ${getTianganColor(parsedBazi.month.tiangan)}`}>{parsedBazi.month.tiangan}</span>
                  <span className={`font-bold text-base ${getDizhiColor(parsedBazi.month.dizhi)}`}>{parsedBazi.month.dizhi}</span>
                </div>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-14 h-20 bg-gradient-to-b from-gray-800 to-black rounded-lg flex flex-col items-center justify-center text-white text-sm shadow-lg border-2 border-yellow-400">
                  <span className={`font-bold text-base ${getTianganColor(parsedBazi.day.tiangan)}`}>{parsedBazi.day.tiangan}</span>
                  <span className={`font-bold text-base ${getDizhiColor(parsedBazi.day.dizhi)}`}>{parsedBazi.day.dizhi}</span>
                </div>
                <div className="text-xs text-yellow-600 font-bold mt-1">日主</div>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-14 h-20 bg-gradient-to-b from-gray-800 to-black rounded-lg flex flex-col items-center justify-center text-white text-sm shadow-lg">
                  <span className={`font-bold text-base ${getTianganColor(parsedBazi.hour.tiangan)}`}>{parsedBazi.hour.tiangan}</span>
                  <span className={`font-bold text-base ${getDizhiColor(parsedBazi.hour.dizhi)}`}>{parsedBazi.hour.dizhi}</span>
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
                  <span className="text-gray-800 font-medium">{baziData.性别}</span>
                </div>
                <div>
                  <span className="text-gray-600">历法：</span>
                  <span className="text-gray-800 font-medium">{birthInfo.calendarType === 'solar' ? '阳历' : '农历'}</span>
                </div>
                <div className="col-span-2">
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

          {/* 新增八字解读部分 */}
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-6 shadow-2xl">
            <h3 className="text-gray-800 font-bold text-lg mb-4">八字解读</h3>
            {!interpretation ? (
              <div className="text-gray-600 text-center py-4">正在生成解读...</div>
            ) : (
              <div className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                {interpretation || '暂无解读内容'}
              </div>
            )}
          </div>
        </div>

        {isLoadingInterpretation ? (<div className="px-6 pb-8 space-y-4" >
          <Button
            onClick={handleTodayFortune}
            className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-6 text-xl rounded-2xl flex items-center justify-center space-x-3 shadow-lg transform hover:scale-105 transition-all"
          >
            <img src="/lovable-uploads/2e9885fc-8b67-4b5c-97f8-398da5754f06.png" alt="今年运势" className="w-8 h-8" />
            <span>今年运势</span>
          </Button>

          <Button
            onClick={handleLifeConsultation}
            className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-bold py-6 text-xl rounded-2xl flex items-center justify-center space-x-3 shadow-lg transform hover:scale-105 transition-all"
          >
            <img src="/lovable-uploads/9b6ea808-9eb1-4077-94cf-629f71a5e56a.png" alt="人生问事" className="w-8 h-8" />
            <span>人生问事</span>
          </Button>
        </div>) : ""}

      </div>
    </div>
  );
};

export default BaziResult;
