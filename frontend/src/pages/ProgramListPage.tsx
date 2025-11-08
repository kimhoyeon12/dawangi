import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TalkBubble } from '../components/TalkBubble';
import { ProgramCard } from '../components/ProgramCard';
import { useAppStore } from '../stores/appStore';
import { chatAPI, type ProgramInfo } from '../utils/api';

// 학과별 참여 가능한 융합전공 매핑
const DEPARTMENT_PROGRAMS: Record<string, string[]> = {
  '경영학부': ['위기관리', '벤처비즈니스', '지식재산 스마트융합'],
  '경영정보학과': ['빅데이터', '보안컨설팅', '공공데이터사이언스', '벤처비즈니스', '지식재산 스마트융합', '이차전지융합'],
  '국제경영학과': ['벤처비즈니스', '지식재산 스마트융합'],
};

export function ProgramListPage() {
  const navigate = useNavigate();
  const { selectedDepartment, setProgram } = useAppStore();
  const [programs, setPrograms] = useState<ProgramInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPrograms();
  }, []);

  const loadPrograms = async () => {
    try {
      const data = await chatAPI.getAvailablePrograms();
      console.log('📦 API Response:', data);
      console.log('📍 Selected Department:', selectedDepartment);

      // 학과별 필터링
      let filteredPrograms = data.programs;
      if (selectedDepartment && selectedDepartment !== '미선택') {
        const allowedPrograms = DEPARTMENT_PROGRAMS[selectedDepartment] || [];
        console.log('✅ Allowed programs for', selectedDepartment, ':', allowedPrograms);
        filteredPrograms = data.programs.filter((program) =>
          allowedPrograms.includes(program.name)
        );
        console.log('🔍 Filtered programs:', filteredPrograms);
      }

      setPrograms(filteredPrograms);
      console.log('✨ Final programs state:', filteredPrograms);
    } catch (error) {
      console.error('Failed to load programs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectProgram = (program: ProgramInfo) => {
    setProgram(program.name);
    navigate(`/chat?program=${program.id}`);
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-warm-white p-6 pb-24">
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
          <h1 className="text-2xl font-bold text-charcoal">전공 목록</h1>
        </div>

        {/* 다왕 말풍선 */}
        <TalkBubble>
          <div className="space-y-2">
            <p className="text-lg font-medium">
              {selectedDepartment === '미선택' ? '전공을 선택해보라왕!' : `${selectedDepartment}냐왕! 관련 전공들이다왕!`}
            </p>
            {programs.length > 0 && (
              <p className="text-sm">
                총 <span className="font-bold text-cbnu-red">{programs.length}개</span>의 융합전공이 있다왕~!
              </p>
            )}
          </div>
        </TalkBubble>

        {/* 전공 카드 목록 */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cbnu-red mx-auto" />
            <p className="mt-4 text-cool-gray">로딩 중...</p>
          </div>
        ) : programs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-cool-gray">전공 목록을 불러올 수 없다왕... 😅</p>
          </div>
        ) : (
          <div className="space-y-3">
            {programs.map((program) => (
              <ProgramCard
                key={program.id}
                name={program.name}
                type={program.type}
                onClick={() => handleSelectProgram(program)}
              />
            ))}
          </div>
        )}

        {/* 질문 유도 */}
        <TalkBubble tone="info">
          <p className="font-medium">궁금한게 있다면 전공을 선택해보라왕!</p>
        </TalkBubble>
      </div>
    </div>
  );
}
