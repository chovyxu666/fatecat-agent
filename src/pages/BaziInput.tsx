import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { cats } from '../data/cats';
import { ChevronLeft } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

// 中国省市区数据 - 扩展为三级联动
const locationData = {
  '北京市': {
    '东城区': ['东华门街道', '景山街道', '交道口街道', '安定门街道', '北新桥街道'],
    '西城区': ['西长安街街道', '新街口街道', '月坛街道', '展览路街道', '德胜街道'],
    '朝阳区': ['建国门外街道', '朝外街道', '呼家楼街道', '三里屯街道', '左家庄街道'],
    '丰台区': ['右安门街道', '太平桥街道', '西罗园街道', '大红门街道', '南苑街道'],
    '石景山区': ['八宝山街道', '老山街道', '八角街道', '古城街道', '苹果园街道'],
    '海淀区': ['万寿路街道', '永定路街道', '羊坊店街道', '甘家口街道', '八里庄街道']
  },
  '上海市': {
    '黄浦区': ['南京东路街道', '外滩街道', '半淞园路街道', '小东门街道', '豫园街道'],
    '徐汇区': ['天平路街道', '湖南路街道', '斜土路街道', '枫林路街道', '长桥街道'],
    '长宁区': ['华阳路街道', '江苏路街道', '新华路街道', '周家桥街道', '天山路街道'],
    '静安区': ['江宁路街道', '石门二路街道', '南京西路街道', '静安寺街道', '曹家渡街道'],
    '普陀区': ['曹杨新村街道', '长风新村街道', '长寿路街道', '甘泉路街道', '石泉路街道'],
    '虹口区': ['乍浦路街道', '新港路街道', '欧阳路街道', '曲阳路街道', '广中路街道']
  },
  '广东省': {
    '广州市': ['越秀区', '海珠区', '荔湾区', '天河区', '白云区', '黄埔区'],
    '深圳市': ['罗湖区', '福田区', '南山区', '宝安区', '龙岗区', '盐田区'],
    '珠海市': ['香洲区', '斗门区', '金湾区'],
    '汕头市': ['龙湖区', '金平区', '濠江区', '潮阳区', '潮南区', '澄海区'],
    '佛山市': ['禅城区', '南海区', '顺德区', '高明区', '三水区'],
    '韶关市': ['武江区', '浈江区', '曲江区', '始兴县', '仁化县', '翁源县']
  },
  '浙江省': {
    '杭州市': ['上城区', '下城区', '江干区', '拱墅区', '西湖区', '滨江区'],
    '宁波市': ['海曙区', '江北区', '北仑区', '镇海区', '鄞州区', '奉化区'],
    '温州市': ['鹿城区', '龙湾区', '瓯海区', '洞头区', '永嘉县', '平阳县'],
    '嘉兴市': ['南湖区', '秀洲区', '嘉善县', '海盐县', '海宁市', '平湖市'],
    '湖州市': ['吴兴区', '南浔区', '德清县', '长兴县', '安吉县'],
    '绍兴市': ['越城区', '柯桥区', '上虞区', '新昌县', '诸暨市', '嵊州市']
  }
};

const BaziInput = () => {
  const { catId } = useParams<{ catId: string }>();
  const navigate = useNavigate();
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [calendarType, setCalendarType] = useState<'solar' | 'lunar'>('solar');
  const [year, setYear] = useState('2000');
  const [month, setMonth] = useState('01');
  const [day, setDay] = useState('01');
  const [hour, setHour] = useState('12');
  const [minute, setMinute] = useState('00');
  const [province, setProvince] = useState('北京市');
  const [city, setCity] = useState('东城区');
  const [district, setDistrict] = useState('东华门街道');

  const cat = cats.find(c => c.id === catId);

  if (!cat) {
    return <div>Cat not found</div>;
  }

  const years = Array.from({ length: 124 }, (_, i) => (2024 - i).toString());
  const months = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
  const days = Array.from({ length: 31 }, (_, i) => (i + 1).toString().padStart(2, '0'));
  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
  const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

  const cities = Object.keys(locationData[province] || {});
  const districts = locationData[province]?.[city] || [];

  useEffect(() => {
    const availableCities = Object.keys(locationData[province] || {});
    if (availableCities.length > 0) {
      setCity(availableCities[0]);
    }
  }, [province]);

  useEffect(() => {
    const availableDistricts = locationData[province]?.[city] || [];
    if (availableDistricts.length > 0) {
      setDistrict(availableDistricts[0]);
    }
  }, [province, city]);

  const isFormValid = year && month && day && hour && minute && province && city && district;

  const handleSubmit = () => {
    if (!isFormValid) return;
    
    const birthInfo = {
      gender,
      calendarType,
      year,
      month,
      day,
      hour,
      minute,
      province,
      city,
      district
    };
    
    navigate(`/bazi-result/${catId}`, {
      state: { birthInfo }
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
            onClick={() => navigate('/')}
            className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <div className="flex-1" />
        </div>

        {/* Cat Avatar and Title */}
        <div className="text-center px-6 mb-8">
          <div className="w-24 h-24 mx-auto rounded-full overflow-hidden border-4 border-white/20 mb-3">
            <img
              src={cat.avatar}
              alt={cat.name}
              className="w-full h-full object-cover"
            />
          </div>
          <h2 className="text-white text-lg font-bold mb-1">你好呀，我是{cat.name}。</h2>
          <p className="text-white/80 text-sm">
            八字命理需要准确的出生信息，请仔细填写哦～
          </p>
        </div>

        {/* Form */}
        <div className="flex-1 px-6 pb-6">
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-6 space-y-6 shadow-2xl">
            {/* Gender Selection */}
            <div>
              <label className="block text-gray-800 font-semibold mb-4 text-lg">性别</label>
              <div className="flex space-x-4">
                <button
                  onClick={() => setGender('female')}
                  className={`flex-1 py-4 px-6 rounded-2xl border-2 transition-all font-medium ${
                    gender === 'female'
                      ? 'border-pink-400 bg-pink-50 text-pink-600 shadow-lg scale-105'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:shadow-md'
                  }`}
                >
                  ♀ 女生
                </button>
                <button
                  onClick={() => setGender('male')}
                  className={`flex-1 py-4 px-6 rounded-2xl border-2 transition-all font-medium ${
                    gender === 'male'
                      ? 'border-blue-400 bg-blue-50 text-blue-600 shadow-lg scale-105'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:shadow-md'
                  }`}
                >
                  ♂ 男生
                </button>
              </div>
            </div>

            {/* Calendar Type Selection */}
            <div>
              <label className="block text-gray-800 font-semibold mb-4 text-lg">历法类型</label>
              <div className="flex space-x-4">
                <button
                  onClick={() => setCalendarType('solar')}
                  className={`flex-1 py-4 px-6 rounded-2xl border-2 transition-all font-medium ${
                    calendarType === 'solar'
                      ? 'border-orange-400 bg-orange-50 text-orange-600 shadow-lg scale-105'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:shadow-md'
                  }`}
                >
                  ☀️ 阳历
                </button>
                <button
                  onClick={() => setCalendarType('lunar')}
                  className={`flex-1 py-4 px-6 rounded-2xl border-2 transition-all font-medium ${
                    calendarType === 'lunar'
                      ? 'border-purple-400 bg-purple-50 text-purple-600 shadow-lg scale-105'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:shadow-md'
                  }`}
                >
                  🌙 农历
                </button>
              </div>
            </div>

            {/* Birth Date - Improved for mobile */}
            <div>
              <label className="block text-gray-800 font-semibold mb-4 text-lg">出生时间</label>
              <div className="grid grid-cols-3 gap-2 mb-4">
                <Select value={year} onValueChange={setYear}>
                  <SelectTrigger className="h-14 rounded-xl border-2 bg-white text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-2 rounded-xl shadow-xl max-h-64 z-50">
                    {years.map(y => (
                      <SelectItem key={y} value={y} className="py-3 text-sm">{y}年</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={month} onValueChange={setMonth}>
                  <SelectTrigger className="h-14 rounded-xl border-2 bg-white text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-2 rounded-xl shadow-xl z-50">
                    {months.map(m => (
                      <SelectItem key={m} value={m} className="py-3 text-sm">{m}月</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={day} onValueChange={setDay}>
                  <SelectTrigger className="h-14 rounded-xl border-2 bg-white text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-2 rounded-xl shadow-xl max-h-64 z-50">
                    {days.map(d => (
                      <SelectItem key={d} value={d} className="py-3 text-sm">{d}日</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Select value={hour} onValueChange={setHour}>
                  <SelectTrigger className="h-14 rounded-xl border-2 bg-white text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-2 rounded-xl shadow-xl max-h-64 z-50">
                    {hours.map(h => (
                      <SelectItem key={h} value={h} className="py-3 text-sm">{h}时</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={minute} onValueChange={setMinute}>
                  <SelectTrigger className="h-14 rounded-xl border-2 bg-white text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-2 rounded-xl shadow-xl max-h-64 z-50">
                    {minutes.map(m => (
                      <SelectItem key={m} value={m} className="py-3 text-sm">{m}分</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Birth Location - 三级联动 */}
            <div>
              <label className="block text-gray-800 font-semibold mb-4 text-lg">出生地点</label>
              <div className="space-y-3">
                <Select value={province} onValueChange={setProvince}>
                  <SelectTrigger className="h-14 rounded-xl border-2 bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-2 rounded-xl shadow-xl max-h-48 z-50">
                    {Object.keys(locationData).map(p => (
                      <SelectItem key={p} value={p} className="py-3">{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={city} onValueChange={setCity}>
                  <SelectTrigger className="h-14 rounded-xl border-2 bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-2 rounded-xl shadow-xl max-h-48 z-50">
                    {cities.map(c => (
                      <SelectItem key={c} value={c} className="py-3">{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={district} onValueChange={setDistrict}>
                  <SelectTrigger className="h-14 rounded-xl border-2 bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-2 rounded-xl shadow-xl max-h-48 z-50">
                    {districts.map(d => (
                      <SelectItem key={d} value={d} className="py-3">{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button - Increased height */}
        <div className="px-6 pb-8">
          <Button
            onClick={handleSubmit}
            disabled={!isFormValid}
            className={`w-full font-bold py-6 text-xl rounded-2xl transition-all shadow-lg ${
              isFormValid
                ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white transform hover:scale-105'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            八字排盘
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BaziInput;
