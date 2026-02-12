
import React, { useEffect } from 'react';
import { ArrowLeft, BookOpen, ScrollText } from 'lucide-react';
import { AppSettings } from '../types';
import { TRANSLATIONS } from '../constants';

interface Props {
  onBack: () => void;
  settings: AppSettings;
}

export const Screen10_TermsOfService: React.FC<Props> = ({ onBack, settings }) => {
  const isDark = settings.darkMode;
  const isKO = settings.language === 'ko';
  const t = TRANSLATIONS[settings.language];

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = isKO ? "이용약관 | ESL Game Lab" : "Terms of Service | ESL Game Lab";
  }, [isKO]);

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8 pb-32 font-sans">
      <div className="flex items-center">
        <button
          onClick={onBack}
          className={`p-2 rounded-lg border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_rgba(15,23,42,1)] transition-all ${
            isDark ? 'bg-slate-700 text-white' : 'bg-white text-slate-900'
          }`}
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>

      <div className="text-center space-y-4">
        <ScrollText className={`w-12 h-12 mx-auto ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
        <h1 className={`text-2xl font-black font-['Press_Start_2P'] uppercase ${isDark ? 'text-yellow-400' : 'text-slate-800'}`}>
          {t.termsOfService}
        </h1>
      </div>

      <div className={`border-4 border-black rounded-3xl p-6 md:p-10 space-y-8 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] leading-relaxed ${
        isDark ? 'bg-slate-800 text-slate-300' : 'bg-white text-slate-700'
      }`}>
        
        {isKO ? (
          /* Korean Content */
          <>
            <section className="space-y-3">
              <h2 className="font-bold text-blue-500 uppercase font-['VT323'] tracking-widest text-2xl border-b-2 border-slate-100 pb-2">1. 서비스 개요</h2>
              <p>ESL Game Lab은 교사 및 교육 종사자를 위한 영어 수업 게임 추천 및 관리 플랫폼입니다. 본 서비스는 AI를 활용하여 사용자에게 최적화된 교육 콘텐츠를 제안합니다.</p>
            </section>

            <section className="space-y-3">
              <h2 className="font-bold text-blue-500 uppercase font-['VT323'] tracking-widest text-2xl border-b-2 border-slate-100 pb-2">2. 이용 대상</h2>
              <p>본 서비스는 수업을 설계하는 교사, 성인 교육자 및 교육 콘텐츠 개발자를 주 대상으로 합니다. 미성년자가 서비스를 이용할 경우 보호자의 지도가 권장됩니다.</p>
            </section>

            <section className="space-y-3">
              <h2 className="font-bold text-blue-500 uppercase font-['VT323'] tracking-widest text-2xl border-b-2 border-slate-100 pb-2">3. 계정 및 인증</h2>
              <p>일부 기능(즐겨찾기 동기화 등)은 Google 로그인 또는 이메일 계정 생성을 통해 이용할 수 있습니다. 사용자는 자신의 계정 정보를 안전하게 관리할 책임이 있습니다.</p>
            </section>

            <section className="space-y-3">
              <h2 className="font-bold text-blue-500 uppercase font-['VT323'] tracking-widest text-2xl border-b-2 border-slate-100 pb-2">4. 금지 사항</h2>
              <p>서비스를 부적절하게 해킹하거나, 타인의 개인정보를 도용하는 행위, 서비스 운영을 방해하는 행위는 금지되며 위반 시 이용이 제한될 수 있습니다.</p>
            </section>

            <section className="space-y-3">
              <h2 className="font-bold text-blue-500 uppercase font-['VT323'] tracking-widest text-2xl border-b-2 border-slate-100 pb-2">5. 지식재산권</h2>
              <p>ESL Game Lab 브랜드명, 로고, 디자인 및 고유 기술은 본 서비스에 귀속됩니다. AI가 생성한 게임 내용의 경우, 실제 수업 현장에서의 비영리적 활용을 권장합니다.</p>
            </section>

            <section className="space-y-3">
              <h2 className="font-bold text-blue-500 uppercase font-['VT323'] tracking-widest text-2xl border-b-2 border-slate-100 pb-2">6. 면책 조항</h2>
              <p>본 서비스는 AI 모델(Gemini)을 기반으로 정보를 생성하므로, 실제 교육 현장에서의 적용 전 교사의 검토가 반드시 필요합니다. 생성된 정보의 정확성에 대해 완벽한 보장을 하지는 않습니다.</p>
            </section>

            <section className="space-y-3">
              <h2 className="font-bold text-blue-500 uppercase font-['VT323'] tracking-widest text-2xl border-b-2 border-slate-100 pb-2">7. 책임의 한계</h2>
              <p>서비스 이용 중 발생한 간접적 손해에 대해 서비스 제공자는 법률이 허용하는 범위 내에서 책임을 지지 않습니다.</p>
            </section>

            <section className="space-y-3">
              <h2 className="font-bold text-blue-500 uppercase font-['VT323'] tracking-widest text-2xl border-b-2 border-slate-100 pb-2">8. 약관의 변경</h2>
              <p>본 약관은 운영 상황에 따라 변경될 수 있으며, 주요 변경 사항은 웹사이트를 통해 공지합니다.</p>
            </section>

            <section className="space-y-3">
              <h2 className="font-bold text-blue-500 uppercase font-['VT323'] tracking-widest text-2xl border-b-2 border-slate-100 pb-2">9. 문의처</h2>
              <p>이용약관 및 서비스 관련 문의는 Contact 페이지를 이용해 주시기 바랍니다.</p>
            </section>
          </>
        ) : (
          /* English Content */
          <>
            <section className="space-y-3">
              <h2 className="font-bold text-blue-500 uppercase font-['VT323'] tracking-widest text-2xl border-b-2 border-slate-100 pb-2">1. Service Overview</h2>
              <p>ESL Game Lab is a platform providing game recommendations and management tools for English teachers and educators. It uses AI to suggest pedagogical activities.</p>
            </section>

            <section className="space-y-3">
              <h2 className="font-bold text-blue-500 uppercase font-['VT323'] tracking-widest text-2xl border-b-2 border-slate-100 pb-2">2. Intended Users</h2>
              <p>This service is designed for teachers, adult educators, and curriculum developers. Parental guidance is recommended for users under 18.</p>
            </section>

            <section className="space-y-3">
              <h2 className="font-bold text-blue-500 uppercase font-['VT323'] tracking-widest text-2xl border-b-2 border-slate-100 pb-2">3. Account & Auth</h2>
              <p>Features like cloud synchronization require Google or Email accounts. Users are responsible for maintaining the confidentiality of their account information.</p>
            </section>

            <section className="space-y-3">
              <h2 className="font-bold text-blue-500 uppercase font-['VT323'] tracking-widest text-2xl border-b-2 border-slate-100 pb-2">4. Acceptable Use</h2>
              <p>Hacking, unauthorized access, or disrupting the service is strictly prohibited and may result in a suspension of use.</p>
            </section>

            <section className="space-y-3">
              <h2 className="font-bold text-blue-500 uppercase font-['VT323'] tracking-widest text-2xl border-b-2 border-slate-100 pb-2">5. Intellectual Property</h2>
              <p>The ESL Game Lab brand, logos, and design are proprietary. AI-generated game content is recommended for non-commercial educational use in classrooms.</p>
            </section>

            <section className="space-y-3">
              <h2 className="font-bold text-blue-500 uppercase font-['VT323'] tracking-widest text-2xl border-b-2 border-slate-100 pb-2">6. Disclaimer</h2>
              <p>As content is generated by AI (Gemini), teachers must review suggestions before classroom implementation. We do not guarantee absolute accuracy of the output.</p>
            </section>

            <section className="space-y-3">
              <h2 className="font-bold text-blue-500 uppercase font-['VT323'] tracking-widest text-2xl border-b-2 border-slate-100 pb-2">7. Liability</h2>
              <p>The service provider is not liable for indirect damages arising from the use of the service to the extent permitted by law.</p>
            </section>

            <section className="space-y-3">
              <h2 className="font-bold text-blue-500 uppercase font-['VT323'] tracking-widest text-2xl border-b-2 border-slate-100 pb-2">8. Changes to Terms</h2>
              <p>These terms may be updated. Significant changes will be announced on the website.</p>
            </section>

            <section className="space-y-3">
              <h2 className="font-bold text-blue-500 uppercase font-['VT323'] tracking-widest text-2xl border-b-2 border-slate-100 pb-2">9. Contact Information</h2>
              <p>For inquiries regarding these terms, please visit the Contact screen.</p>
            </section>
          </>
        )}
      </div>
    </div>
  );
};
