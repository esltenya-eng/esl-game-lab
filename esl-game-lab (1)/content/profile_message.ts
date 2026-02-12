
export const PROFILE_MESSAGES = {
  en: "I'm Jay, a consultant for English education. I developed 'ESL Game Lab' to help my fellow teachers save time and create more engaging lessons. Your feedback is essential for me to keep improving the engine. Thank you for your support!",
  ko: "안녕하세요, 영어 교육 컨설턴트 Jay입니다. 동료 선생님들의 수업 준비 시간을 줄이고 더 즐거운 수업을 만드실 수 있도록 'ESL Game Lab'을 개발했습니다. 여러분의 소중한 피드백이 엔진을 발전시키는 데 큰 힘이 됩니다. 응원해주셔서 감사합니다!",
  ja: "こんにちは、英語教育コンサルタントのJay입니다. 同僚の先生方の授業準備時間を短축し、より魅力적인 授業を作れるよう「ESL Game Lab」を開発しました。皆様の貴重なフィードバックが、エンジンの向上に不可欠です。応援ありがとうございます！",
  zh: "你好，我是英语教育顾问 Jay。我开发了 'ESL Game Lab'，旨在帮助同行教师节省时间，创造更具吸引力的课堂。您的反馈对于我持续改进引擎至关重要。感谢您的支持！"
};

export const PROFILE_MESSAGE = PROFILE_MESSAGES.en;

// Checksum to prevent accidental replacement
export const PROFILE_CHECKSUM = "FEB25_LOCALIZED_V1_JAY";

if (!PROFILE_MESSAGES) {
  console.warn("ESL GAME LAB: Profile message content file is empty!");
}
