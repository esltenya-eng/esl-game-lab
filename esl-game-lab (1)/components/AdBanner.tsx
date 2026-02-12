
import React, { useEffect, useRef } from 'react';

interface Props {
  isDark: boolean;
  isLoading: boolean;
}

declare global {
  interface Window {
    PartnersCoupang: any;
  }
}

export const AdBanner: React.FC<Props> = ({ isDark, isLoading }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // 스크립트 로드 상태를 전역적으로 추적하여 단 1회만 로드되도록 함
  const SCRIPT_URL = "https://ads-partners.coupang.com/g.js";

  useEffect(() => {
    const initAd = () => {
      if (!containerRef.current) return;

      try {
        // 1. 컨테이너 초기화 (재마운트/라우팅 시 중복 방지)
        containerRef.current.innerHTML = '';

        // 2. 스크립트가 이미 있는지 확인
        const existingScript = document.querySelector(`script[src="${SCRIPT_URL}"]`);

        const render = () => {
          if (window.PartnersCoupang && containerRef.current) {
            requestAnimationFrame(() => {
              try {
                new window.PartnersCoupang.G({
                  "id": 953439,
                  "template": "carousel",
                  "trackingCode": "AF9106066",
                  "width": "790",
                  "height": "90",
                  "container": containerRef.current,
                  "tsource": ""
                });
              } catch (e) {
                console.warn("Coupang Ad Render Error:", e);
              }
            });
          }
        };

        if (window.PartnersCoupang) {
          render();
        } else if (!existingScript) {
          const script = document.createElement('script');
          script.src = SCRIPT_URL;
          script.async = true;
          script.onload = render;
          document.head.appendChild(script);
        } else {
          // 스크립트가 이미 로드 중이거나 로드된 경우, 로드 이벤트를 기다리거나 즉시 렌더
          (existingScript as HTMLScriptElement).addEventListener('load', render);
        }
      } catch (err) {
        console.error("Ad System Failure:", err);
      }
    };

    // DOM이 완전히 안정된 후 실행
    const timer = setTimeout(initAd, 100);
    return () => {
      clearTimeout(timer);
      if (containerRef.current) containerRef.current.innerHTML = '';
    };
  }, []);

  return (
    <div className="w-full py-4 mt-4 animate-in fade-in duration-700">
      <div className="max-w-4xl mx-auto px-4 md:px-6">
        {/* 모서리 라운딩(rounded-2xl) 제거 및 직사각형 형태로 조정 */}
        <div className={`
          relative overflow-hidden border-2 border-slate-900 rounded-none 
          transition-colors duration-300
          ${isDark ? 'bg-slate-800' : 'bg-white'}
        `}>
          <div 
            ref={containerRef}
            className="flex justify-center items-center w-full min-h-[90px] overflow-hidden bg-transparent"
            style={{ minHeight: '94px' }}
          >
            {/* Ad Content Injected Here */}
          </div>
          
          {isLoading && (
            <div className={`absolute inset-0 z-10 opacity-30 ${isDark ? 'bg-slate-900' : 'bg-slate-200'} animate-pulse pointer-events-none`} />
          )}
        </div>
        
        {/* 쿠팡 파트너스 안내 문구 추가 (푸터 텍스트 크기와 동일하게 text-[10px] md:text-xs 적용) */}
        <p className={`mt-2 text-center text-[10px] md:text-xs font-medium leading-relaxed ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
          이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.
        </p>
      </div>
    </div>
  );
};
