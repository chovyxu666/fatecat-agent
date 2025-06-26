
import { TarotCard } from '../types';

export const tarotCards: TarotCard[] = [
  {
    id: 'hermit',
    name: '隐士',
    image: '/lovable-uploads/7959332e-0350-40a9-9d99-45e8d32dd7fc.png',
    position: 'past',
    meaning: '内省与寻求内在智慧'
  },
  {
    id: 'high-priestess',
    name: '女祭司',
    image: '/lovable-uploads/548d1ede-171b-418c-a59e-fac922fcaca0.png',
    position: 'present',
    meaning: '直觉与隐藏的知识'
  },
  {
    id: 'emperor',
    name: '皇帝',
    image: '/lovable-uploads/3bdd2e23-5ef2-4190-98ee-20bc6d0dbc09.png',
    position: 'future',
    meaning: '权威与稳定的力量'
  },
  {
    id: 'fool',
    name: '愚者',
    image: '/lovable-uploads/3adb304c-6f9c-4d1a-bec8-9ba2d5bbb628.png',
    position: 'past',
    meaning: '新的开始与纯真'
  },
  {
    id: 'magician',
    name: '魔术师',
    image: '/lovable-uploads/8559992e-e057-4f01-863a-5a01ba3449e0.png',
    position: 'present',
    meaning: '意志力与创造力'
  },
  {
    id: 'high-priestess-new',
    name: '女教皇',
    image: '/lovable-uploads/8c43b0ea-b154-4354-9b79-3cb6c73a2d27.png',
    position: 'future',
    meaning: '神秘智慧与精神指导'
  },
  {
    id: 'empress',
    name: '皇后',
    image: '/lovable-uploads/784d5768-b369-4e06-bb99-07639a13b244.png',
    position: 'past',
    meaning: '丰富与母性能量'
  },
  {
    id: 'emperor-new',
    name: '皇帝',
    image: '/lovable-uploads/74a79576-eb1f-4062-8cc3-5098cdaf18f2.png',
    position: 'present',
    meaning: '领导力与秩序'
  },
  {
    id: 'hierophant',
    name: '教皇',
    image: '/lovable-uploads/206bc9e9-97a3-403d-8c7b-5b05c65087e1.png',
    position: 'future',
    meaning: '传统智慧与精神指导'
  },
  {
    id: 'lovers',
    name: '恋人',
    image: '/lovable-uploads/0a492b67-60e4-44b0-8a67-6874ef1cec6f.png',
    position: 'past',
    meaning: '爱情与选择'
  },
  {
    id: 'chariot',
    name: '战车',
    image: '/lovable-uploads/9b32cc27-da7b-4d2e-b25b-4372c3f84284.png',
    position: 'present',
    meaning: '意志力与前进的动力'
  },
  {
    id: 'strength',
    name: '力量',
    image: '/lovable-uploads/9594d129-2e15-417c-8d69-051186040c20.png',
    position: 'future',
    meaning: '内在力量与勇气'
  },
  // 新增的塔罗牌
  {
    id: 'hermit-new',
    name: '隐士',
    image: '/lovable-uploads/1ef07d0c-33d2-4a6f-82a9-a2f734f511f8.png',
    position: 'past',
    meaning: '寻找内在的光明与指引'
  },
  {
    id: 'wheel-of-fortune',
    name: '命运之轮',
    image: '/lovable-uploads/c478b957-c57f-4996-9c0b-93b83bae54e3.png',
    position: 'present',
    meaning: '变化的循环与机遇'
  },
  {
    id: 'justice',
    name: '正义',
    image: '/lovable-uploads/6d4132dd-3645-4015-b79d-bc28c14e1c22.png',
    position: 'future',
    meaning: '公正与平衡的力量'
  },
  {
    id: 'hanged-man',
    name: '倒吊人',
    image: '/lovable-uploads/b2a5f9d3-79de-4306-af80-040cec991368.png',
    position: 'past',
    meaning: '牺牲与不同视角的启示'
  },
  {
    id: 'death',
    name: '死神',
    image: '/lovable-uploads/9720f844-9e85-4c40-8899-70d010599cc4.png',
    position: 'present',
    meaning: '转变与重生的时刻'
  },
  {
    id: 'temperance',
    name: '节制',
    image: '/lovable-uploads/06d5f5a7-a6c7-41d4-91d0-9d36c5c10b1c.png',
    position: 'future',
    meaning: '和谐与平衡的艺术'
  },
  {
    id: 'devil',
    name: '恶魔',
    image: '/lovable-uploads/254fd2a4-d5af-43e4-ab84-e7852785bea0.png',
    position: 'past',
    meaning: '束缚与诱惑的挑战'
  },
  {
    id: 'tower',
    name: '塔',
    image: '/lovable-uploads/ed10b16e-90fc-4a31-bd56-55262feb2933.png',
    position: 'present',
    meaning: '突然的变化与觉醒'
  },
  {
    id: 'star',
    name: '星星',
    image: '/lovable-uploads/b626b804-a660-4934-be20-2dc9b582baeb.png',
    position: 'future',
    meaning: '希望与灵感的指引'
  }
];

// 随机选择三张牌的函数
export const getRandomCards = (): TarotCard[] => {
  const shuffled = [...tarotCards].sort(() => Math.random() - 0.5);
  
  // 确保每个位置都有一张牌
  const pastCards = shuffled.filter(card => card.position === 'past');
  const presentCards = shuffled.filter(card => card.position === 'present');
  const futureCards = shuffled.filter(card => card.position === 'future');
  
  const selectedCards = [
    pastCards[Math.floor(Math.random() * pastCards.length)],
    presentCards[Math.floor(Math.random() * presentCards.length)],
    futureCards[Math.floor(Math.random() * futureCards.length)]
  ];
  
  return selectedCards;
};
