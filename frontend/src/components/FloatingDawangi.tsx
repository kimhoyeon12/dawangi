import { useNavigate } from 'react-router-dom';
import { DawangiAvatar } from './DawangiAvatar';
import { useAppStore } from '../stores/appStore';

export function FloatingDawangi() {
  const navigate = useNavigate();
  const { setProgram, setDepartment, setProgramType } = useAppStore();

  const handleClick = () => {
    // 전공 정보 초기화 (기본 챗봇으로)
    setProgram('');
    setDepartment('');
    setProgramType('');

    // 쿼리 파라미터 없이 기본 챗봇으로 이동
    navigate('/chat');
  };

  return (
    <button
      aria-label="다왕이 챗봇 열기"
      onClick={handleClick}
      className="
        fixed bottom-5 right-5 h-16 w-16 rounded-full shadow-lg bg-white
        ring-1 ring-gray-200 overflow-hidden hover:scale-105 transition-transform
        duration-200 z-50 focus:outline-none focus:ring-2 focus:ring-focus-ring
        animate-breathe
      "
    >
      <DawangiAvatar size={64} className="object-cover" />
    </button>
  );
}
