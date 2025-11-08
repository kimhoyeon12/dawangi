import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { FloatingDawangi } from './components/FloatingDawangi';
import { StartPage } from './pages/StartPage';
import { ProgramTypePage } from './pages/ProgramTypePage';
import { DepartmentPage } from './pages/DepartmentPage';
import { ProgramListPage } from './pages/ProgramListPage';
import { ChatPage } from './pages/ChatPage';

function AppContent() {
  const location = useLocation();

  // 시작 페이지와 챗봇 페이지에서는 플로팅 버튼 숨김
  const showFloatingButton = location.pathname !== '/' && location.pathname !== '/chat';

  return (
    <>
      <Routes>
        <Route path="/" element={<StartPage />} />
        <Route path="/program-type" element={<ProgramTypePage />} />
        <Route path="/department" element={<DepartmentPage />} />
        <Route path="/programs" element={<ProgramListPage />} />
        <Route path="/chat" element={<ChatPage />} />
      </Routes>

      {/* 전역 플로팅 다왕 버튼 */}
      {showFloatingButton && <FloatingDawangi />}
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
