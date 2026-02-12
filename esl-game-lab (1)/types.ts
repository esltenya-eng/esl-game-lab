
export interface SelectionState {
  skill: string[];
  level: string[];
  purpose: string[];
  classSize: string[];
  time: string[];
  theme: string[];
}

export interface GameRecommendation {
  id: string;
  ranking: number;
  game_title: string;
  tags: string[];
  thumbnail_image: string;
  summary_en: string; // 팁용 (영문 고정)
  summary_localized?: string; // 목록 출력용 (언어 맞춤)
  icon?: string; // 상단 이모지 아이콘
  grammar_focus?: string; // 검증용: 실제 집중하는 문법 주제 (예: "Imperatives")
  grammar_focus_reason?: string; // 검증용: 해당 문법이 핵심인 이유 (1줄)
}

export interface CatalogGame extends GameDetail {
  id: string;
  source: 'generated' | 'internal';
  season?: string;
  imageUrl?: string;
  createdAt: any;
  updatedAt: any;
}

export interface Screen2Response {
  screen: 2;
  filters: SelectionState;
  recommendations: GameRecommendation[];
}

export interface GameDetail {
  screen: 3;
  game_title: string;
  icon?: string; // 상세 화면용 컬러 이모지
  illustration: string;
  tags: string[];
  materials: string;
  game_description: string;
  how_to_play: string[];
  teacher_directions: {
    simple: string[];
    medium: string[];
    complex: string[];
  };
  student_interactions: string[];
  caution: string;
}

export enum AppScreen {
  SELECTION = 1,
  LIST = 2,
  DETAIL = 3,
  SETTINGS = 4,
  FAVORITES = 5,
  CONTACT = 6,
  PRIVACY = 7,
  AUTH = 8,
  RESET_PASSWORD = 9,
  TERMS = 10,
  ADMIN_EXPORT = 11,
  TOOLS = 12,
  GAMIFICATION_GUIDE = 13,
  GAMIFICATION_TOOLS = 14,
}

export type SupportedLanguage = 'en' | 'ko' | 'ja' | 'zh';

export interface AppSettings {
  darkMode: boolean;
  volume: number;
  fontSize: 'small' | 'medium' | 'large';
  language: SupportedLanguage;
}

export type TeachingLevel = 'Early Childhood' | 'Lower Elementary' | 'Upper Elementary' | 'Middle/Secondary';

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  provider: string;
  nickname?: string;
  teachingLevel?: TeachingLevel;
  password?: string;
}
