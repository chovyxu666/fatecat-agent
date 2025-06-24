
export interface Cat {
  id: string;
  name: string;
  breed: string;
  specialty: string;
  personality: string;
  avatar: string;
  description: string;
  color: string;
}

export interface TarotCard {
  id: string;
  name: string;
  image: string;
  position: 'past' | 'present' | 'future';
  meaning: string;
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'cat';
  timestamp: Date;
}

export interface Reading {
  question: string;
  cards: TarotCard[];
  interpretation: string;
  cat: Cat;
}
