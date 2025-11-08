import { useNavigate } from 'react-router-dom';
import { DawangiAvatar } from '../components/DawangiAvatar';
import { useEmotion } from '../stores/emotionStore';
import { useEffect } from 'react';

export function StartPage() {
  const navigate = useNavigate();
  const { setEmotion } = useEmotion();

  useEffect(() => {
    setEmotion('joy', 'welcome');
  }, [setEmotion]);

  const handleStart = () => {
    navigate('/program-type');
  };

  return (
    <div className="min-h-screen bg-warm-white flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-8 animate-slide-up">
        {/* 다왕 아바타 - 클릭 가능 */}
        <div className="flex justify-center">
          <button
            onClick={handleStart}
            className="relative focus:outline-none group"
            aria-label="다왕이 시작하기"
          >
            <DawangiAvatar size={160} />
            {/* 포커스 링 */}
            <div className="absolute inset-0 rounded-full ring-4 ring-focus-ring opacity-50 animate-ping" />
            {/* 호버 효과 */}
            <div className="absolute inset-0 rounded-full bg-cbnu-red opacity-0 group-hover:opacity-10 transition-opacity" />
          </button>
        </div>

        {/* 웰컴 메시지 */}
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-cbnu-red">
            다왕이
          </h1>
          <p className="text-2xl font-medium text-charcoal">
            내게 다 물어봥!
          </p>
          <p className="text-cool-gray">
            충북대학교 다(부)전공 안내 챗봇
          </p>
        </div>

        {/* 안내 텍스트 */}
        <p className="text-sm text-cool-gray">
          복수전공, 융합전공, 부전공, 연계전공에 대한<br />
          모든 정보를 알려드립니다
        </p>
      </div>
    </div>
  );
}
