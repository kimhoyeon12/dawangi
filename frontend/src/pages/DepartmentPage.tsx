import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TalkBubble } from '../components/TalkBubble';
import { useAppStore } from '../stores/appStore';

// 경영대 관련 학과 목록
const DEPARTMENTS = [
  '경영학부',
  '국제경영학과',
  '경영정보학과',
];

export function DepartmentPage() {
  const navigate = useNavigate();
  const { setDepartment } = useAppStore();

  const handleSelect = (dept: string) => {
    setDepartment(dept);
    navigate('/programs');
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
          <h1 className="text-2xl font-bold text-charcoal">소속 학과 선택</h1>
        </div>

        {/* 다왕 말풍선 */}
        <TalkBubble>
          <div className="space-y-2">
            <p className="text-lg font-medium">
              소속 학과를 알려달라왕!
            </p>
            <p className="text-sm text-cool-gray">
              소속 학과에 따라 참여 가능한 다전공, 중복인정, 추천과목이 달라진다왕!
            </p>
          </div>
        </TalkBubble>

        {/* 학과 목록 - 세로 배치 */}
        <div className="grid grid-cols-1 gap-4">
          {DEPARTMENTS.map((dept) => (
            <button
              key={dept}
              onClick={() => handleSelect(dept)}
              className="
                card text-left hover:shadow-lg hover:border-2 hover:border-cbnu-red
                transition-all duration-200 group
              "
            >
              <h3 className="text-xl font-bold text-charcoal group-hover:text-cbnu-red">
                {dept}
              </h3>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
