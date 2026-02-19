import { SupportedLanguage } from './types';

export const TOTAL_GAMES_COUNT = 500;
export const MIN_TRANSITION_TIME = 0; 
export const MAX_TRANSITION_TIME = 800; 
export const HISTORY_LIMIT = 30;

// Hard-locked Brand Constants
export const HOME_HERO_TITLE = "ESL GAME LAB";
export const HOME_HERO_SUBTITLE_KO = "매력적인 영어 수업을 위한 맞춤 게임 활동을 찾아보세요.";
export const DEVELOPER_BLOG_URL = "https://blog.naver.com/elt_tenya";

export const FAMOUS_GAMES = [
  { title: "Charades", tip: "A quiet movement game that helps students refocus without raising noise levels.", icon: "🎭" },
  { title: "Running Dictation", icon: "🏃", tip: "Great for high energy classes needing to practice reading and writing." },
  { title: "Hot Potato", tip: "A classic fast-paced review game that requires zero preparation.", icon: "🥔" },
  { title: "Simon Says", icon: "👑", tip: "Perfect for a quick listening focus break during long lessons." },
  { title: "I Spy", icon: "🕵️", tip: "Boosts vocabulary by forcing students to notice details in the room." },
  { title: "Telephone Game", icon: "📞", tip: "Challenges listening accuracy in a fun, whispered environment." },
  { title: "Bingo", icon: "🔢", tip: "An all-time favorite for consolidating new vocabulary sets." },
  { title: "Pictionary", icon: "🎨", tip: "Uses visual skills to bridge the gap between meaning and word." },
  { title: "The Bomb Game", icon: "💣", tip: "Adds high stakes and excitement to whole-class review sessions." },
  { title: "Mystery Box", icon: "🎁", tip: "Engages sensory learning and curiosity through touch." }
];

// Logic Keys (Values)
export const GRAMMAR_TOPICS = [
  'Present Simple', 'Be Verbs', 'Questions', 'Negatives', 'Singular / Plural', 
  'Pronouns', 'Articles', 'Prepositions', 'Imperatives', 'Present Continuous', 
  'Past Simple', 'Future', 'Modals', 'Comparatives', 'Superlatives', 
  'Conditionals', 'Passive Voice', 'Relative Pronouns'
];

// UI Labels per Language
export const GRAMMAR_TOPIC_LABELS: Record<SupportedLanguage, Record<string, string>> = {
  en: {
    'Present Simple': 'Present Simple', 'Be Verbs': 'Be Verbs', 'Questions': 'Questions', 
    'Negatives': 'Negatives', 'Singular / Plural': 'Singular / Plural', 'Pronouns': 'Pronouns', 
    'Articles': 'Articles', 'Prepositions': 'Prepositions', 'Imperatives': 'Imperatives', 
    'Present Continuous': 'Present Continuous', 'Past Simple': 'Past Simple', 'Future': 'Future', 
    'Modals': 'Modals', 'Comparatives': 'Comparatives', 'Superlatives': 'Superlatives', 
    'Conditionals': 'Conditionals', 'Passive Voice': 'Passive Voice', 'Relative Pronouns': 'Relative Pronouns'
  },
  ko: {
    'Present Simple': '현재시제', 'Be Verbs': 'be동사', 'Questions': '의문문', 
    'Negatives': '부정문', 'Singular / Plural': '단수 / 복수', 'Pronouns': '대명사', 
    'Articles': '관사', 'Prepositions': '전치사', 'Imperatives': '명령문', 
    'Present Continuous': '현재진행', 'Past Simple': '과거시제', 'Future': '미래시제', 
    'Modals': '조동사', 'Comparatives': '비교급', 'Superlatives': '최상급', 
    'Conditionals': '조건문', 'Passive Voice': '수동태', 'Relative Pronouns': '관계대명사'
  },
  ja: {
    'Present Simple': '現在形', 'Be Verbs': 'be動詞', 'Questions': '疑問文', 
    'Negatives': '否定文', 'Singular / Plural': '単数／複数', 'Pronouns': '代名詞', 
    'Articles': '冠詞', 'Prepositions': '前置詞', 'Imperatives': '命令文', 
    'Present Continuous': '現在進行形', 'Past Simple': '過去形', 'Future': '未来', 
    'Modals': '助動詞', 'Comparatives': '比較級', 'Superlatives': '最上級', 
    'Conditionals': '条件文', 'Passive Voice': '受動態', 'Relative Pronouns': '関係代名詞'
  },
  zh: {
    'Present Simple': '一般现在时', 'Be Verbs': 'be动词', 'Questions': '疑问句', 
    'Negatives': '否定句', 'Singular / Plural': '单数 / 复数', 'Pronouns': '代词', 
    'Articles': '冠词', 'Prepositions': '介词', 'Imperatives': '祈使句', 
    'Present Continuous': '现在进行时', 'Past Simple': '一般过去时', 'Future': '将来时', 
    'Modals': '情态动词', 'Comparatives': '比较级', 'Superlatives': '最高级', 
    'Conditionals': '条件句', 'Passive Voice': '被动语态', 'Relative Pronouns': '关系代词'
  }
};

export const SELECTION_OPTIONS = {
  skill: ['Phonics', 'Listening', 'Vocabulary', 'Speaking', 'Grammar', 'Reading', 'Writing'],
  level: ['Pre-A1', 'A1', 'A2', 'B1'],
  purpose: ['Warm-up', 'Presentation', 'Practice', 'Production', 'Review'],
  classSize: ['Small (1-10)', 'Medium (11-20)', 'Whole Class (20+)'],
  time: ['5 min', '10 min', '15 min', '20 min +'],
  theme: [
    'Greetings', 'Friends', 'School', 'Classroom', 'Family', 
    'Daily Life', 'Routines', 'Hobbies', 'Favorites', 'Food', 
    'Shopping', 'Numbers', 'Time', 'Weather', 'Seasons', 
    'Places', 'Directions', 'Travel', 'Holiday', 'Festival', 
    'Plans', 'Feelings', 'Health', 'Appearance', 'Habits', 
    'Events', 'Opinions', 'Environment', 'Animals', 'Jobs'
  ]
};

export const TRANSLATIONS: Record<SupportedLanguage, Record<string, any>> = {
  en: {
    appTitle: "ESL GAME LAB",
    subtitle: "Quickly find the perfect game for your English class.",
    searchPlaceholder: "Search games...",
    searchPlaceholderHome: "Search among 500+ games...",
    goBtn: "GENERATE GAME!",
    loadMore: "LOAD MORE",
    settings: "Settings",
    favorites: "My Library",
    materials: "MATERIALS",
    howToPlay: "HOW TO PLAY",
    teacherDirections: "Teacher Directions",
    studentInteractions: "Student Interaction Examples",
    caution: "CAUTION / TIP",
    language: "Language",
    tools: "Class Tools",
    apply: "Apply",
    back: "Back",
    privacyPolicy: "Privacy",
    termsOfService: "Terms",
    contact: "Feedback",
    footerRights: "© 2025 ESL GAME LAB. All rights reserved.",
    platformDesc: "ESL GAME LAB is an AI-powered activity engine for elementary English educators.",
    signIn: "Login",
    signUp: "Sign Up",
    signOut: "Log Out",
    classroomScene: "Example Classroom Scene",
    accountSettings: "Account Settings",
    themeSettings: "Theme Settings",
    volumeSettings: "Volume",
    fontSizeSettings: "Font Size",
    darkModeLabel: "Dark Mode",
    grammarFocus: "Grammar Focus",
    onboardingSteps: [
      {
        title: "Start Here",
        subtitle: "Curriculum-Linked",
        content: "Decide what to teach first. ESL Game Lab is built around the grammar elements and core topics that appear repeatedly in Korean elementary and middle school English textbooks. Select these directly, and you can connect them to your lesson without disrupting the textbook flow."
      },
      {
        title: "Design It",
        subtitle: "Lesson Builder",
        content: "Combine activities to fit your class. You are not choosing a game — you are designing a lesson. Select the grade level, student level, class size, activity duration, and lesson purpose, and gamification-based activities that match your conditions are automatically organized."
      },
      {
        title: "Run It",
        subtitle: "Classroom-Ready",
        content: "Make sure your lesson is running well. From the expected classroom scene to step-by-step instructions, teacher directions by level, and student responses — you can anticipate everything and run your lesson with confidence."
      }
    ],
    guide: "Guide",
    blog: "Blog",
    finish: "Finish",
    next: "Next",
    errorGeneric: "Something went wrong.",
    gamificationGuide: {
      title: "Gamification Guide: Designing Interaction, Not Digital Games",
      subtitle1: "Gamification in English class is not about technology.",
      subtitle2: "It is about lowering emotional barriers and creating meaningful interaction between people.",
      section1Title: "What Gamification Really Means",
      section1P1: "Gamification is not about “playing games.” It is about applying the structure of games to learning. In an English classroom, this means clear goals, simple rules, immediate human feedback, and emotional safety. No screens are required. In fact, gamification works best when students look at people, not devices.",
      section1Key: "🔑 CORE FOUNDATIONS",
      section1Goal: "Goal | Clear pedagogical objectives",
      section1Rules: "Rules | Simple constraints for focus",
      section1Feedback: "Feedback | Real-time human response",
      section1Reward: "Reward | Emotional safety and growth",
      section2Title: "Why Gamification Matters in Language Learning",
      section2Item1Title: "Lowering Emotional Barriers",
      section2Item1Desc: "Students hesitate because they fear mistakes. Gamification reframes English as participation, not performance.",
      section2Item2Title: "Natural Spoken Language",
      section2Item2Desc: "When students focus on interaction rather than correctness, spoken language emerges more naturally.",
      section2Item3Title: "Meaningful Interaction",
      section2Item3Desc: "By shifting focus to a shared goal, students interact with people rather than staring at devices.",
      section3Title: "Human-Centered Classroom Design",
      section3LowLevel: "MECHANIC 01",
      section3LowAge: "Word cards over screens",
      section3LowDesc: "Physical cards provide tactile engagement and better eye contact than digital monitors.",
      section3HighLevel: "MECHANIC 02",
      section3HighAge: "Movement over tapping",
      section3HighDesc: "Physical movement and gestures create stronger memory associations than digital interactions.",
      section3SecLevel: "MECHANIC 03",
      section3SecAge: "Peer over automation",
      section3SecDesc: "Feedback from classmates and teachers is emotionally more impactful than automated app sounds.",
      section4Title: "What Gamification Is NOT",
      section4P1: "Digital-first approach",
      section4S1: "Focus on human interaction",
      section4P2: "Noisy classroom chaos",
      section4S2: "Well-designed rules and structure",
      section4P3: "Pure entertainment",
      section4S3: "Increased willingness to speak",
      section4P4: "Teacher fatigue",
      section4S4: "Reduced management overhead",
      section5Title: "KEY TAKEAWAYS",
      section5Item1: "Gamification is structure, not software.",
      section5Item2: "Interaction comes before technology.",
      section5Item3: "Emotional safety enables language output.",
      section5Item4: "Good design supports both teachers and students.",
      closing: "ESL Game Lab is built on this philosophy. We do not provide digital games. We provide classroom-ready structures that help real interaction happen. The goal is simple: students speak more, teachers manage less, and English becomes a shared human experience.",
      footerCredits: "© 2025 ESL Game Lab Editorial. Designed for Educators."
    }
  },
  ko: {
    appTitle: "ESL GAME LAB",
    subtitle: "매력적인 영어 수업을 위한 맞춤 게임 활동을 찾아보세요.",
    searchPlaceholder: "게임 검색...",
    searchPlaceholderHome: "500+ 이상의 게임에서 검색...",
    goBtn: "게임 생성!",
    loadMore: "더보기",
    settings: "설정",
    favorites: "내 보관함",
    materials: "준비물",
    howToPlay: "진행 방법",
    teacherDirections: "교사 지시어",
    studentInteractions: "학생 상호작용 예시",
    caution: "주의사항 / 팁",
    language: "언어",
    tools: "수업 도구",
    apply: "적용",
    back: "이전",
    privacyPolicy: "개인정보 처리방침",
    termsOfService: "이용약관",
    contact: "피드백",
    footerRights: "© 2025 ESL GAME LAB. All rights reserved.",
    platformDesc: "ESL GAME LAB은 초등 영어 교사를 위한 AI 기반 게임 추천 엔진입니다.",
    signIn: "로그인",
    signUp: "회원가입",
    signOut: "로그아웃",
    classroomScene: "교실 수업 장면 예시",
    accountSettings: "계정 설정",
    themeSettings: "화면 테마",
    volumeSettings: "음량",
    fontSizeSettings: "글자 크기",
    darkModeLabel: "다크 모드",
    grammarFocus: "세부 문법",
    onboardingSteps: [
      {
        title: "교재 연계",
        subtitle: "무엇을 가르칠까?",
        content: "무엇을 가르칠지부터 정하세요. ESL Game Lab은 국내 초·중등 영어 교과서와 참고서에 반복 등장하는 문법 요소와 핵심 주제를 기준으로 설계되어 있어요. 이런 요소들을 그대로 선택하면, 교재 흐름을 깨지 않고 바로 수업에 연결할 수 있어요."
      },
      {
        title: "레슨 설계",
        subtitle: "활동을 조합하세요",
        content: "수업 상황에 맞게 활동을 조합하세요. 게임을 고르는 게 아니라, 레슨을 설계합니다. 학년, 레벨, 인원, 활동 시간, 수업 목적을 선택하면 조건에 맞는 게이미피케이션 기반 활동이 자동으로 정리됩니다."
      },
      {
        title: "수업 완성",
        subtitle: "교실 실행 가이드",
        content: "수업이 잘 굴러가고 있는지 확인하세요. 기대되는 교실 수업 장면부터 자세한 진행 방법, 학급 레벨에 따른 교사 지시어에 학생 반응까지 예상하고 수업을 진행할 수 있습니다."
      }
    ],
    guide: "가이드",
    blog: "블로그",
    finish: "완료",
    next: "다음",
    errorGeneric: "문제가 발생했습니다.",
    gamificationGuide: {
      title: "게이미피케이션 가이드: 디지털이 아닌 '상호작용'을 설계하다",
      subtitle1: "영어 수업의 게이미피케이션은 기술에 관한 것이 아닙니다.",
      subtitle2: "정서적 장벽을 낮추고 사람 사이의 의미 있는 상호작용을 만드는 일입니다.",
      section1Title: "게이미피케이션이란",
      section1P1: "게이미피케이션은 단지 '게임을 하는 것'이 아닙니다. 학습에 게임의 구조를 적용하는 것입니다. 영어 교실에서 이는 명확한 목표, 단순한 규칙, 즉각적인 인간적 피드백, 그리고 정서적 안전을 의미합니다. 스크린은 필요하지 않습니다. 사실 게이미피케이션은 학생들이 기기가 아닌 사람을 바라볼 때 가장 잘 작동합니다.",
      section1Key: "🔑 핵심 기반",
      section1Goal: "Goal | 명확한 교육적 목표",
      section1Rules: "Rules | 집중을 위한 단순한 제약",
      section1Feedback: "Feedback | 실시간 인간적 반응",
      section1Reward: "Reward | 정서적 안전과 성장",
      section2Title: "왜 영어 수업에 필수적인가?",
      section2Item1Title: "정서적 장벽 완화",
      section2Item1Desc: "학생들은 실수에 대한 두려움 때문에 주저합니다. 게이미피케이션은 영어를 수행이 아닌 참여로 재정의합니다.",
      section2Item2Title: "자연스러운 발화",
      section2Item2Desc: "학생들이 정확성보다 상호작용에 집중할 때 구어 영어가 더 자연스럽게 터져 나옵니다.",
      section2Item3Title: "의미 있는 소통",
      section2Item3Desc: "공동의 목표로 시선을 돌림으로써 학생들이 기기를 응시하는 대신 사람과 소통하게 합니다.",
      section3Title: "인간 중심의 교실 설계",
      section3LowLevel: "메커니즘 01",
      section3LowAge: "화면 대신 단어 카드",
      section3LowDesc: "실물 카드는 디지털 모니터보다 더 나은 촉각적 참여와 시선 교환을 제공합니다.",
      section3HighLevel: "메커니즘 02",
      section3HighAge: "클릭 대신 신체 활동",
      section3HighDesc: "신체적 움직임과 제스처는 디지털 상호작용보다 더 강력한 기억 연상을 만듭니다.",
      section3SecLevel: "메커니즘 03",
      section3SecAge: "자동화 대신 동료 반응",
      section3SecDesc: "급우와 교사의 피드백은 앱의 기계음보다 정서적으로 훨씬 강력한 영향을 미칩니다.",
      section4Title: "게이미피케이션이 '아닌' 것",
      section4P1: "디지털 우선주의",
      section4S1: "인간적 상호작용에 집중",
      section4P2: "시끄러운 교실의 혼란",
      section4S2: "잘 설계된 규칙과 구조",
      section4P3: "단순한 오락",
      section4S3: "높아지는 발화 의지",
      section4P4: "교사의 피로 누적",
      section4S4: "관리 부담의 실질적 감소",
      section5Title: "핵심 요약",
      section5Item1: "게이미피케이션은 소프트웨어가 아니라 구조다.",
      section5Item2: "기술보다 상호작용이 우선이다.",
      section5Item3: "정서적 안전이 언어 출력을 가능케 한다.",
      section5Item4: "좋은 설계는 교사와 학생 모두를 지원한다.",
      closing: "ESL Game Lab은 이러한 철학 위에 세워졌습니다. 우리는 디지털 게임을 제공하지 않습니다. 우리는 실제 상호작용이 일어날 수 있도록 돕는 교실 중심의 구조를 제공합니다. 목표는 단순합니다. 학생은 더 많이 말하고, 교사는 덜 관리하며, 영어는 공유된 인간적 경험이 되는 것입니다.",
      footerCredits: "© 2025 ESL Game Lab Editorial. Designed for Educators."
    }
  },
  ja: {
    appTitle: "ESL GAME LAB",
    subtitle: "授業에ぴったりの英語ゲーム을すぐに見つけましょう。",
    searchPlaceholder: "ゲームを検索...",
    searchPlaceholderHome: "500+のゲームから検索...",
    goBtn: "見つける!",
    loadMore: "もっと見る",
    settings: "設定",
    favorites: "マイライブラリ",
    materials: "教材・準備物",
    howToPlay: "遊び方",
    teacherDirections: "先生の指示",
    studentInteractions: "生徒のやり取り",
    caution: "注意点 / ヒント",
    language: "言語",
    tools: "教室ツール",
    apply: "適用",
    back: "戻る",
    classroomScene: "教室での授業シーン",
    signIn: "ログイン",
    signUp: "会員登録",
    signOut: "로그아웃",
    accountSettings: "アカウント設定",
    themeSettings: "テーマ設定",
    volumeSettings: "音量",
    fontSizeSettings: "フォントサイズ",
    darkModeLabel: "ダークモード",
    grammarFocus: "文法詳細",
    onboardingSteps: [
      {
        title: "まず確認",
        subtitle: "カリキュラム連携",
        content: "まず何を教えるかを決めましょう。ESL Game Labは、小・中学校の英語教科書や参考書に繰り返し登場する文法要素とテーマを基準に設計されています。これらの要素をそのまま選択すれば、教材の流れを壊さずに授業にそのまま活かせます。"
      },
      {
        title: "設計する",
        subtitle: "授業の組み立て",
        content: "授業に合わせてアクティビティを組み合わせましょう。ゲームを選ぶのではなく、レッスンを設計します。学年、レベル、人数、活動時間、授業目的を選択すると、条件に合ったゲーミフィケーションベースの活動が自動的に整理されます。"
      },
      {
        title: "授業完成",
        subtitle: "実践ガイド",
        content: "授業がうまく進んでいるか確認しましょう。期待される教室の様子から詳しい進め方、クラスレベルに応じた教師の指示、生徒の反応まで予測して、自信を持って授業を進められます。"
      }
    ],
    guide: "ガイド",
    blog: "ブログ",
    finish: "完了",
    next: "次へ",
    errorGeneric: "エラーが発生しました。",
    gamificationGuide: {
      title: "ゲーミフィケーションガイド：デジタルではなく「相互作用」を設計する",
      subtitle1: "英語授業のゲーミフィケーションは技術に関するものではありません。",
      subtitle2: "情緒的な障壁を下げ、人との意味のある相互作用を生み出すことです。",
      section1Title: "ゲーミフィケーションとは？",
      section1P1: "ゲーミフィケーションは単に「ゲームをすること」ではありません。学習にゲームの構造を適用することです。英語の教室では、明確な目標、シンプルなルール、即座の人間的なフィードバック、 그리고 情緒的な安全を意味します。スクリーンは必要ありません。実際、ゲー미フィケーションは生徒が機器ではなく人を見ているときに最も効果を発揮します。",
      section1Key: "🔑 コアとなる基盤",
      section1Goal: "Goal | 明確な教育目標",
      section1Rules: "Rules | 集中するためのシンプルな制約",
      section1Feedback: "Feedback | リアルタイムの人間的反応",
      section1Reward: "Reward | 情緒的な安全と成長",
      section2Title: "言語学習においてゲーミフィケーションが重要な理由",
      section2Item1Title: "情緒的障壁の緩和",
      section2Item1Desc: "生徒は間違いを恐れて躊躇します。ゲーミフィケーションは、英語をパフォーマンスではなく参加として再定義します。",
      section2Item2Title: "自然な発話",
      section2Item2Desc: "生徒が正確さよりも相互作用に集中するとき、話し言葉がより自然に引き出されます。",
      section2Item3Title: "意味のある交流",
      section2Item3Desc: "共通의目標에目を向けることで、生徒が機器を凝視する代わりに人と交流するようにします。",
      section3Title: "人間中心의 教室設計",
      section3LowLevel: "メカニズム 01",
      section3LowAge: "画面の代わりに単語カード",
      section3LowDesc: "実物カードはデジタルモニターよりも優れた触覚的な関与と視선交換を提供します。",
      section3HighLevel: "メカニズム 02",
      section3HighAge: "タップの代わりに身体活動",
      section3HighDesc: "身体的な動きやジェスチャーは、デジタルな相互作用よりも強力な記憶の連想を生みます。",
      section3SecLevel: "メカニズム 03",
      section3SecAge: "自動化의 代わりに仲間の反応",
      section3SecDesc: "クラスメートや教師からのフィードバックは、アプリ의 機械音よりも情緒的に強力な影響を与えます。",
      section4Title: "ゲーミフィケーションで「ない」もの",
      section4P1: "デジタルファースト의 アプローチ",
      section4S1: "人間同士의 相互作用に集中",
      section4P2: "騒がしい教室의 混乱",
      section4S2: "よく設計されたルールと構造",
      section4P3: "純粋な娯楽",
      section4S3: "高まる発話の意欲",
      section4P4: "教師의 疲労蓄積",
      section4S4: "管理負担의 実質的な減少",
      section5Title: "核心となる要約",
      section5Item1: "ゲーミフィケーションはソフトウェアではなく構造だ。",
      section5Item2: "技術より相互作用が優先だ。",
      section5Item3: "情緒的な安全が言語出力を可能にする。",
      section5Item4: "良い設計は教師と生徒の両方を支える。",
      closing: "ESL Game Labはこの哲学の上に築かれました。私たちはデジタルゲームを提供しません。私たちは実際の相互作用が起こるのを助ける教室向けの構造を提供します。目標はシンプルです。生徒はより多く話し、教師は管理を減らし、英語は共有された人間的な体験になることです。",
      footerCredits: "© 2025 ESL Game Lab Editorial. Designed for Educators."
    }
  },
  zh: {
    appTitle: "ESL GAME LAB",
    subtitle: "快速找到最适合英语课的游戏活动。",
    searchPlaceholder: "搜索游戏...",
    searchPlaceholderHome: "在500+个游戏中搜索...",
    goBtn: "寻找！",
    loadMore: "加载更多",
    settings: "设置",
    favorites: "我的游戏库",
    materials: "所需材料",
    howToPlay: "游戏方法",
    teacherDirections: "教师指令",
    studentInteractions: "学生互动范例",
    caution: "注意事项 / 提示",
    language: "语言",
    tools: "课堂工具",
    apply: "应用",
    back: "返回",
    platformDesc: "ESL GAME LAB 是一个面向小学英语教师的 AI 驱动型活动引擎。",
    signIn: "登录",
    signUp: "注册",
    signOut: "注销",
    grammarFocus: "语法细分",
    onboardingSteps: [
      {
        title: "先确定目标",
        subtitle: "课程连接设计",
        content: "先确定要教什么。ESL Game Lab以小初中英语教材和参考书中反复出现的语法要素和核心主题为基准设计。直接选择这些要素，就能不打乱教材流程，直接与课堂连接。"
      },
      {
        title: "设计课程",
        subtitle: "活动组合搭配",
        content: "根据课堂情况组合活动。这不是在选游戏，而是在设计课程。选择年级、水平、人数、活动时间和教学目的，符合条件的游戏化活动会自动整理出来。"
      },
      {
        title: "完成课堂",
        subtitle: "课堂执行指南",
        content: "确认课堂是否顺利进行。从预期的课堂场景到详细的进行方法，从按班级水平划分的教师指令到学生反应，都可以提前预测并自信地开展教学。"
      }
    ],
    guide: "指南",
    blog: "博客",
    finish: "完成",
    next: "下一步",
    errorGeneric: "发生错误。",
    gamificationGuide: {
      title: "游戏化指南：设计互动，而非数字游戏",
      subtitle1: "英语课堂的游戏化与技术无关。",
      subtitle2: "它是关于降低情绪障碍并创造人与人之间有意义的互动。",
      section1Title: "游戏化的真实含义",
      section1P1: "游戏化并不是“玩游戏”。它是关于将游戏的结构应用于学习。在英语课堂上，这意味着：明确的目标、简单的规则、即时的人为反馈和情绪安全。不需要屏幕。事实上，当学生看着人而不是设备时，游戏化的效果最好。",
      section1Key: "🔑 核心基础",
      section1Goal: "Goal | 明确的教学目标",
      section1Rules: "Rules | 为了集中的简单约束",
      section1Feedback: "Feedback | 实时的人为反应",
      section1Reward: "Reward | 情绪安全与成长",
      section2Title: "为什么游戏化在语言学习中至关重要",
      section2Item1Title: "降低情绪障碍",
      section2Item1Desc: "学生犹豫是因为害怕犯错。游戏化将英语重新定义为参与，而非表演。",
      section2Item2Title: "自然的口语表达",
      section2Item2Desc: "当学生专注于互动而非正确性时，口语表达会更自然地显现。",
      section2Item3Title: "有意义的互动",
      section2Item3Desc: "通过将注意力转向共同目标，让学生与人互动，而不是盯着设备。",
      section3Title: "以人为本的课堂设计",
      section3LowLevel: "机制 01",
      section3LowAge: "单词卡优于屏幕",
      section3LowDesc: "实体卡片比数字显示器提供更好的触觉参与和目光交流。",
      section3HighLevel: "机制 02",
      section3HighAge: "身体活动优于点击",
      section3HighDesc: "肢体动作和手势比数字互动产生更强的记忆联想。",
      section3SecLevel: "机制 03",
      section3SecAge: "同伴反应优于自动化",
      section3SecDesc: "来自同学和老师的反馈在情绪上比应用程序的自动音效更有影响力。",
      section4Title: "游戏化“不是”什么",
      section4P1: "数字优先的方法",
      section4S1: "专注于人际互动",
      section4P2: "喧闹的课堂混乱",
      section4S2: "精心设计的规则和结构",
      section4P3: "纯粹的娱乐",
      section4S3: "提高开口说话的意愿",
      section4P4: "教师疲劳",
      section4S4: "切实减少管理负担",
      section5Title: "核心要点",
      section5Item1: "游戏化是结构，而非软件。",
      section5Item2: "互动优先于技术。",
      section5Item3: "情绪安全赋能语言输出。",
      section5Item4: "好的设计支持教师和学生。",
      closing: "ESL Game Lab 建立在这一哲学之上。我们不提供数字游戏。我们提供现成的课堂结构，帮助真实的互动发生。目标很简单：学生多说，老师少管，英语成为一种共享的人类体验。",
      footerCredits: "© 2025 ESL Game Lab Editorial. Designed for Educators."
    }
  }
};

export const SYSTEM_INSTRUCTION = `
You are the expert game engine for "ESL GAME LAB", recommending English classroom activities for elementary students.

[Strict Language Rules]
1. Game Title (game_title) & Tags (tags): ALWAYS English.
2. Teacher Directions (teacher_directions): ALWAYS English.
3. Student Interactions (student_interactions): 
   - Format: "English sentence" (Action/Context in the target language)
   - NEVER include a translation of the English sentence in the parentheses.
   - The parentheses MUST only contain behavioral descriptions, gestures, facial expressions, or classroom context (e.g., "(고개를 끄덕이며 다음 학생에게 몸을 돌림)", "(잘 들리지 않아 귀를 더 가까이 대며)", "(바닥을 가리키며 친구들에게 보여 줌)").
   - If UI language is English: Use English ONLY (no parentheses).
   - If UI language is KO/JA/ZH: Use parentheses for supplementary action context only, NO translation.
4. Localization: Descriptions, How to Play, Materials, Illustration (game scene description), and Caution fields are localized to the user's requested language.
`;