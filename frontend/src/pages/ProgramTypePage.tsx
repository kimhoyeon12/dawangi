import { useNavigate } from 'react-router-dom';
import { TalkBubble } from '../components/TalkBubble';
import { useAppStore } from '../stores/appStore';

const PROGRAM_TYPES = [
  { id: 'convergence', label: '융합전공', description: '여러 학문 분야를 융합한 전공', enabled: true },
  { id: 'double', label: '복수전공', description: '두 개의 전공을 동시에 이수', enabled: false },
  { id: 'minor', label: '부전공', description: '주전공 외에 추가로 이수하는 전공', enabled: false },
  { id: 'linked', label: '연계전공', description: '여러 학과가 연계하여 운영하는 전공', enabled: false },
];

export function ProgramTypePage() {
  const navigate = useNavigate();
  const { setProgramType } = useAppStore();

  const handleSelect = (type: string) => {
    setProgramType(type);
    navigate('/department');
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-warm-white p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* 헤더 */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleBack}
            className="p-2 hover:bg-gray-100 rounded-full transition"
            aria-label="뒤로 가기"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-2xl font-bold text-charcoal">전공 유형 선택</h1>
        </div>

        {/* 다왕 말풍선 */}
        <TalkBubble>
          <p className="text-lg font-medium">
            궁금한 전공을 선택해보라왕!
          </p>
        </TalkBubble>

        {/* 전공 유형 버튼들 */}
        <div className="grid grid-cols-1 gap-4">
          {PROGRAM_TYPES.map((type) => (
            <button
              key={type.id}
              onClick={() => type.enabled && handleSelect(type.label)}
              disabled={!type.enabled}
              className={`
                card text-left transition-all duration-200 group
                ${type.enabled
                  ? 'hover:shadow-lg hover:border-2 hover:border-cbnu-red cursor-pointer'
                  : 'opacity-50 cursor-not-allowed bg-gray-50'
                }
              `}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className={`text-xl font-bold mb-2 ${type.enabled ? 'text-charcoal group-hover:text-cbnu-red' : 'text-gray-400'}`}>
                    {type.label}
                  </h3>
                  <p className={type.enabled ? 'text-cool-gray' : 'text-gray-400'}>
                    {type.description}
                  </p>
                </div>
                {!type.enabled && (
                  <span className="ml-4 px-3 py-1 bg-gray-200 text-gray-500 text-sm font-medium rounded-full">
                    개발중
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* 안내 텍스트 */}
        <div className="text-center text-sm text-cool-gray">
          <p>전공 유형을 선택하면 관련 정보를 확인할 수 있어요</p>
        </div>
      </div>
    </div>
  );
}
