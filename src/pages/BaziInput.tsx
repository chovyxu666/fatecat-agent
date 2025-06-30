
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { cats } from '../data/cats';
import { ChevronLeft } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

// 中国省市区数据
const locationData = {
  '北京市': ['东城区', '西城区', '朝阳区', '丰台区', '石景山区', '海淀区'],
  '天津市': ['和平区', '河东区', '河西区', '南开区', '河北区', '红桥区'],
  '河北省': ['石家庄市', '唐山市', '秦皇岛市', '邯郸市', '邢台市', '保定市'],
  '山西省': ['太原市', '大同市', '阳泉市', '长治市', '晋城市', '朔州市'],
  '内蒙古自治区': ['呼和浩特市', '包头市', '乌海市', '赤峰市', '通辽市', '鄂尔多斯市'],
  '辽宁省': ['沈阳市', '大连市', '鞍山市', '抚顺市', '本溪市', '丹东市'],
  '吉林省': ['长春市', '吉林市', '四平市', '辽源市', '通化市', '白山市'],
  '黑龙江省': ['哈尔滨市', '齐齐哈尔市', '鸡西市', '鹤岗市', '双鸭山市', '大庆市'],
  '上海市': ['黄浦区', '徐汇区', '长宁区', '静安区', '普陀区', '虹口区'],
  '江苏省': ['南京市', '无锡市', '徐州市', '常州市', '苏州市', '南通市'],
  '浙江省': ['杭州市', '宁波市', '温州市', '嘉兴市', '湖州市', '绍兴市'],
  '安徽省': ['合肥市', '芜湖市', '蚌埠市', '淮南市', '马鞍山市', '淮北市'],
  '福建省': ['福州市', '厦门市', '莆田市', '三明市', '泉州市', '漳州市'],
  '江西省': ['南昌市', '景德镇市', '萍乡市', '九江市', '新余市', '鹰潭市'],
  '山东省': ['济南市', '青岛市', '淄博市', '枣庄市', '东营市', '烟台市'],
  '河南省': ['郑州市', '开封市', '洛阳市', '平顶山市', '安阳市', '鹤壁市'],
  '湖北省': ['武汉市', '黄石市', '十堰市', '宜昌市', '襄阳市', '鄂州市'],
  '湖南省': ['长沙市', '株洲市', '湘潭市', '衡阳市', '邵阳市', '岳阳市'],
  '广东省': ['广州市', '韶关市', '深圳市', '珠海市', '汕头市', '佛山市'],
  '广西壮族自治区': ['南宁市', '柳州市', '桂林市', '梧州市', '北海市', '防城港市'],
  '海南省': ['海口市', '三亚市', '三沙市', '儋州市'],
  '重庆市': ['万州区', '涪陵区', '渝中区', '大渡口区', '江北区', '沙坪坝区'],
  '四川省': ['成都市', '自贡市', '攀枝花市', '泸州市', '德阳市', '绵阳市'],
  '贵州省': ['贵阳市', '六盘水市', '遵义市', '安顺市', '毕节市', '铜仁市'],
  '云南省': ['昆明市', '曲靖市', '玉溪市', '保山市', '昭通市', '丽江市'],
  '西藏自治区': ['拉萨市', '日喀则市', '昌都市', '林芝市', '山南市', '那曲市'],
  '陕西省': ['西安市', '铜川市', '宝鸡市', '咸阳市', '渭南市', '延安市'],
  '甘肃省': ['兰州市', '嘉峪关市', '金昌市', '白银市', '天水市', '武威市'],
  '青海省': ['西宁市', '海东市', '海北藏族自治州', '黄南藏族自治州'],
  '宁夏回族自治区': ['银川市', '石嘴山市', '吴忠市', '固原市', '中卫市'],
  '新疆维吾尔自治区': ['乌鲁木齐市', '克拉玛依市', '吐鲁番市', '哈密市']
};

const BaziInput = () => {
  const { catId } = useParams<{ catId: string }>();
  const navigate = useNavigate();
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [year, setYear] = useState('2000');
  const [month, setMonth] = useState('01');
  const [day, setDay] = useState('01');
  const [hour, setHour] = useState('12');
  const [minute, setMinute] = useState('00');
  const [province, setProvince] = useState('北京市');
  const [city, setCity] = useState('东城区');

  const cat = cats.find(c => c.id === catId);

  if (!cat) {
    return <div>Cat not found</div>;
  }

  const years = Array.from({ length: 124 }, (_, i) => (2024 - i).toString());
  const months = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
  const days = Array.from({ length: 31 }, (_, i) => (i + 1).toString().padStart(2, '0'));
  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
  const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

  const handleSubmit = () => {
    const birthInfo = {
      gender,
      year,
      month,
      day,
      hour,
      minute,
      province,
      city
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
            这里是你心灵的避风港，每一张牌都会像羽毛般轻轻托住你的困惑。慢慢诉说，我会陪你找到答案。
          </p>
        </div>

        {/* Form */}
        <div className="flex-1 px-6 pb-6">
          <div className="bg-white/90 rounded-2xl p-6 space-y-6">
            {/* Gender Selection */}
            <div>
              <label className="block text-gray-700 font-medium mb-3">性别</label>
              <div className="flex space-x-4">
                <button
                  onClick={() => setGender('female')}
                  className={`flex-1 py-3 px-4 rounded-full border-2 transition-all ${
                    gender === 'female'
                      ? 'border-pink-400 bg-pink-50 text-pink-600'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                  }`}
                >
                  ♀ 女生
                </button>
                <button
                  onClick={() => setGender('male')}
                  className={`flex-1 py-3 px-4 rounded-full border-2 transition-all ${
                    gender === 'male'
                      ? 'border-blue-400 bg-blue-50 text-blue-600'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                  }`}
                >
                  ♂ 男生
                </button>
              </div>
            </div>

            {/* Birth Date */}
            <div>
              <label className="block text-gray-700 font-medium mb-3">出生时间</label>
              <div className="grid grid-cols-3 gap-3 mb-3">
                <Select value={year} onValueChange={setYear}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map(y => (
                      <SelectItem key={y} value={y}>{y}年</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={month} onValueChange={setMonth}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map(m => (
                      <SelectItem key={m} value={m}>{m}月</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={day} onValueChange={setDay}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {days.map(d => (
                      <SelectItem key={d} value={d}>{d}日</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Select value={hour} onValueChange={setHour}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {hours.map(h => (
                      <SelectItem key={h} value={h}>{h}时</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={minute} onValueChange={setMinute}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {minutes.map(m => (
                      <SelectItem key={m} value={m}>{m}分</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Birth Location */}
            <div>
              <label className="block text-gray-700 font-medium mb-3">出生地点</label>
              <div className="grid grid-cols-2 gap-3">
                <Select value={province} onValueChange={(value) => {
                  setProvince(value);
                  setCity(locationData[value]?.[0] || '');
                }}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(locationData).map(p => (
                      <SelectItem key={p} value={p}>{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={city} onValueChange={setCity}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(locationData[province] || []).map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="px-6 pb-8">
          <Button
            onClick={handleSubmit}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 text-lg rounded-full"
          >
            八字排盘
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BaziInput;
