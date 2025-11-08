import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface ChatRequest {
  question: string;
  profile_dept?: string;
  selected_program?: string;
  program_name?: string;
}

export interface ChatResponse {
  answer: string;
  label: string;
  emotion: 'neutral' | 'joy' | 'embarrassed' | 'proud';
  success: boolean;
}

export interface ProgramInfo {
  id: string;
  name: string;
  type: string;
}

// API 함수들
export const chatAPI = {
  /**
   * 챗봇에 질문 전송
   */
  async sendMessage(request: ChatRequest): Promise<ChatResponse> {
    const response = await api.post<ChatResponse>('/api/chat', request);
    return response.data;
  },

  /**
   * 질문 라우팅 (분류)
   */
  async routeQuestion(
    question: string,
    profileDept?: string,
    selectedProgram?: string
  ): Promise<{ label: string; success: boolean }> {
    const response = await api.post('/api/route', {
      question,
      profile_dept: profileDept,
      selected_program: selectedProgram,
    });
    return response.data;
  },

  /**
   * 사용 가능한 전공 목록 조회
   */
  async getAvailablePrograms(): Promise<{ programs: ProgramInfo[] }> {
    const response = await api.get('/api/programs/available');
    return response.data;
  },

  /**
   * 전체 전공 현황 조회
   */
  async getProgramCatalog(): Promise<{ programs: ProgramInfo[] }> {
    const response = await api.get('/api/programs/catalog');
    return response.data;
  },

  /**
   * 서버 헬스 체크
   */
  async healthCheck(): Promise<{ status: string }> {
    const response = await api.get('/health');
    return response.data;
  },
};

export default api;
