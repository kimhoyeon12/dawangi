import { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { TalkBubble } from '../components/TalkBubble';
import { useAppStore } from '../stores/appStore';
import { useEmotion } from '../stores/emotionStore';
import { chatAPI, type ChatRequest } from '../utils/api';

interface Message {
  id: string;
  type: 'user' | 'bot' | 'info';
  content: string;
  timestamp: Date;
}

// 융합전공별 맞춤 설명
const PROGRAM_DESCRIPTIONS: Record<string, { greeting: string; description: string[] }> = {
  '빅데이터': {
    greeting: '빅데이터 융합전공을 선택하다니! 탁월한 선택이다왕! 내가 빅데이터 융합전공에 대해 자세하게 알려주겠다왕!',
    description: [
      '빅데이터 분석 및 처리 기술을 전문적으로 학습',
      '데이터 사이언스, 머신러닝, AI 기술 습득',
      '실무 중심의 프로젝트 기반 교육과정 운영',
      '데이터 분석가, AI 엔지니어 등 다양한 진로 가능',
      '산업체 연계 실습 및 인턴십 기회 제공'
    ]
  },
  '지식재산 스마트융합': {
    greeting: '지식재산 스마트융합 전공을 선택하다니! 탁월한 선택이다왕! 내가 지식재산 스마트융합 전공에 대해 자세하게 알려주겠다왕!',
    description: [
      '지식재산권과 스마트 기술의 융합 전공',
      '특허, 상표, 저작권 등 지식재산 전문 지식 습득',
      'AI, IoT 등 스마트 기술과 법률의 결합',
      '지식재산 전문가, 변리사, 기업 IP 담당자 진로',
      '4차 산업혁명 시대의 핵심 인재 양성'
    ]
  },
  '위기관리': {
    greeting: '위기관리 전공을 선택하다니! 탁월한 선택이다왕! 내가 위기관리 전공에 대해 자세하게 알려주겠다왕!',
    description: [
      '재난, 안전, 위기 상황 대응 전문가 양성',
      '위기관리 이론과 실무 능력 배양',
      '재난안전관리, 비상계획 수립 및 운영',
      '공공기관, 기업 안전관리 부서 진로',
      '실습 중심의 체계적인 교육과정 운영'
    ]
  },
  '보안컨설팅': {
    greeting: '보안컨설팅 전공을 선택하다니! 탁월한 선택이다왕! 내가 보안컨설팅 전공에 대해 자세하게 알려주겠다왕!',
    description: [
      '정보보안 및 컨설팅 전문가 양성 과정',
      '사이버 보안, 네트워크 보안 기술 습득',
      '보안 컨설팅 방법론 및 실무 교육',
      '정보보안 전문가, 보안 컨설턴트 진로',
      '다양한 보안 자격증 취득 지원'
    ]
  },
  '벤처비즈니스': {
    greeting: '벤처비즈니스 전공을 선택하다니! 탁월한 선택이다왕! 내가 벤처비즈니스 전공에 대해 자세하게 알려주겠다왕!',
    description: [
      '창업 및 벤처 경영 실무 능력 배양',
      '비즈니스 모델 개발 및 사업계획 수립',
      '스타트업 생태계 이해 및 네트워킹',
      '창업가, 벤처 투자자, 혁신 관리자 진로',
      '실전 창업 프로젝트 및 멘토링 제공'
    ]
  },
  '이차전지융합': {
    greeting: '이차전지융합 전공을 선택하다니! 탁월한 선택이다왕! 내가 이차전지융합 전공에 대해 자세하게 알려주겠다왕!',
    description: [
      '차세대 에너지 저장 기술 전문 인재 양성',
      '배터리 기술, 전기화학, 소재 공학 학습',
      '전기차, ESS 등 실무 응용 기술 습득',
      '배터리 기업, 전기차 업체 연구개발 진로',
      '산업체 수요 맞춤형 교육과정 운영'
    ]
  },
  '공공데이터사이언스': {
    greeting: '공공데이터사이언스 전공을 선택하다니! 탁월한 선택이다왕! 내가 공공데이터사이언스 전공에 대해 자세하게 알려주겠다왕!',
    description: [
      '공공 부문의 데이터 분석 전문가 양성',
      '정책 수립 및 의사결정을 위한 데이터 활용',
      '공공데이터 수집, 분석, 시각화 기술 습득',
      '공공기관, 정부부처 데이터 분석가 진로',
      '사회문제 해결을 위한 데이터 기반 접근'
    ]
  },
};

// 퀵 키워드 생성 함수 (전공 선택 시)
const getQuickKeywordsProgram = (dept: string, program: string) => [
  { id: 'requirements', label: '졸업요건', question: `${program} 융합전공의 졸업요건이 어떻게 되나요?` },
  { id: 'curriculum', label: '교과목', question: `${program} 융합전공에서 어떤 과목을 배우나요?` },
  { id: 'overlap', label: '중복과목', question: dept ? `${dept} 학생이 ${program} 전공 할 때 중복 인정되는 과목은?` : `${program} 전공 중복 인정되는 과목은?` },
  { id: 'professor', label: '주임교수', question: `${program} 융합전공 주임교수님이 누구예요?` },
];

// 퀵 키워드 (기본 챗봇)
const QUICK_KEYWORDS_GENERAL = [
  { id: 'what', label: '융합전공이란?', question: '융합전공이 뭐예요?' },
  { id: 'list', label: '전공 목록', question: '어떤 융합전공들이 있나요?' },
  { id: 'difference', label: '제도 차이', question: '연계전공과 융합전공의 차이는?' },
  { id: 'apply', label: '신청 방법', question: '다전공 신청은 언제 하나요?' },
];

// 예시 질문 생성 함수 (전공 선택 시)
const getExampleQuestionsProgram = (dept: string, program: string) => [
  `${program} 융합전공 졸업하려면 몇 학점 필요한가요?`,
  `${program} 융합전공의 전공필수 과목이 뭐예요?`,
  `${program} 융합전공은 어느 학과에서 개설되나요?`,
  `${program} 융합전공 이수하면 무슨 학위를 받나요?`,
  dept ? `${dept} 학생이 ${program} 전공 할 때 중복 인정 되는 과목 알려주세요` : `${program} 전공 중복 인정 되는 과목 알려주세요`,
];

// 예시 질문 (기본 챗봇)
const EXAMPLE_QUESTIONS_GENERAL = [
  '융합전공이 뭐예요?',
  '충북대에 융합전공이 몇 개 있어요?',
  '가장 최근에 개설된 융합전공은?',
  '복수전공과 융합전공의 차이는?',
  '다전공 신청 자격이 어떻게 되나요?',
];

export function ChatPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const programId = searchParams.get('program');

  const { selectedDepartment, selectedProgram } = useAppStore();
  const { setEmotion } = useEmotion();

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 전공 선택 여부에 따라 다른 예시 질문과 키워드 사용
  const exampleQuestions = selectedProgram
    ? getExampleQuestionsProgram(selectedDepartment, selectedProgram)
    : EXAMPLE_QUESTIONS_GENERAL;
  const quickKeywords = selectedProgram
    ? getQuickKeywordsProgram(selectedDepartment, selectedProgram)
    : QUICK_KEYWORDS_GENERAL;

  // 플레이스홀더 순환
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % exampleQuestions.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [exampleQuestions]);

  // 스크롤 자동 이동
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 초기 웰컴 메시지
  useEffect(() => {
    const initialMessages: Message[] = [];

    // 특정 전공 선택 시 맞춤형 메시지
    if (selectedProgram && PROGRAM_DESCRIPTIONS[selectedProgram]) {
      const programInfo = PROGRAM_DESCRIPTIONS[selectedProgram];

      // 맞춤형 인사 메시지
      initialMessages.push({
        id: 'greeting',
        type: 'bot',
        content: programInfo.greeting,
        timestamp: new Date(),
      });

      // 전공 설명
      initialMessages.push({
        id: 'description',
        type: 'info',
        content: programInfo.description.join('\n'),
        timestamp: new Date(),
      });

      // 질문 유도 메시지
      initialMessages.push({
        id: 'guide',
        type: 'bot',
        content: '궁금한게 있다면 이런 식으로 질문해봐라왕~',
        timestamp: new Date(),
      });
    } else {
      // 일반 웰컴 메시지
      initialMessages.push({
        id: 'welcome',
        type: 'bot',
        content: '어서와! 내가 다 알려줄거다왕! 걱정하지마왕~',
        timestamp: new Date(),
      });

      initialMessages.push({
        id: 'guide',
        type: 'bot',
        content: '궁금한게 있다면 이런 식으로 질문해봐라왕~',
        timestamp: new Date(),
      });
    }

    setMessages(initialMessages);
    setEmotion('joy', 'welcome');
  }, [setEmotion, selectedProgram]);

  const handleSend = async (question?: string) => {
    const message = question || inputValue.trim();
    if (!message || loading) return;

    // 사용자 메시지 추가
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: message,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setLoading(true);

    try {
      // API 호출
      const request: ChatRequest = {
        question: message,
        profile_dept: selectedDepartment,
        selected_program: selectedProgram,
        program_name: programId || undefined,
      };

      const response = await chatAPI.sendMessage(request);

      // 봇 메시지 추가
      const botMsg: Message = {
        id: `bot-${Date.now()}`,
        type: 'bot',
        content: response.answer,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMsg]);

      // 감정 상태 업데이트
      setEmotion(response.emotion, 'response');
    } catch (error) {
      console.error('Failed to send message:', error);
      const errorMsg: Message = {
        id: `error-${Date.now()}`,
        type: 'bot',
        content: '오류가 발생했다왕... 😅 잠시 후 다시 시도해보라왕!',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
      setEmotion('embarrassed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="flex flex-col h-screen bg-warm-white">
      {/* 헤더 */}
      <div className="bg-pure-white shadow-sm p-4 flex items-center gap-4">
        <button
          onClick={handleBack}
          className="p-2 hover:bg-gray-100 rounded-full transition"
          aria-label="뒤로 가기"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h1 className="text-lg font-bold text-charcoal">다왕이 챗봇</h1>
          {selectedProgram && (
            <p className="text-sm text-cool-gray">{selectedProgram}</p>
          )}
        </div>
      </div>

      {/* 메시지 영역 */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id}>
            {msg.type === 'bot' ? (
              <TalkBubble variant="left">
                <div className="whitespace-pre-wrap">{msg.content}</div>
              </TalkBubble>
            ) : msg.type === 'info' ? (
              <div className="card bg-warm-white border-2 border-gray-200">
                <div className="whitespace-pre-wrap text-charcoal leading-relaxed">
                  {msg.content.split('\n').map((line, idx) => (
                    <div key={idx} className="flex items-start gap-2 mb-2 last:mb-0">
                      <span className="text-cbnu-red mt-1">•</span>
                      <span>{line}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <TalkBubble variant="right" withAvatar={false}>
                <div className="whitespace-pre-wrap">{msg.content}</div>
              </TalkBubble>
            )}
          </div>
        ))}

        {loading && (
          <TalkBubble variant="left">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-cool-gray rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-cool-gray rounded-full animate-bounce delay-100" />
              <div className="w-2 h-2 bg-cool-gray rounded-full animate-bounce delay-200" />
            </div>
          </TalkBubble>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 퀵 키워드 */}
      <div className="px-6 py-3 bg-pure-white border-t border-gray-200">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {quickKeywords.map((keyword) => (
            <button
              key={keyword.id}
              onClick={() => handleSend(keyword.question)}
              className="capsule-btn whitespace-nowrap flex-shrink-0"
              disabled={loading}
            >
              {keyword.label}
            </button>
          ))}
        </div>
      </div>

      {/* 입력창 */}
      <div className="p-4 bg-pure-white border-t border-gray-200">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={exampleQuestions[placeholderIndex]}
            disabled={loading}
            className="
              flex-1 px-4 py-3 rounded-dawangi border-2 border-gray-200
              focus:border-cbnu-red focus:outline-none transition
              disabled:bg-gray-100
            "
          />
          <button
            onClick={() => handleSend()}
            disabled={!inputValue.trim() || loading}
            className="
              btn-primary px-6
              disabled:opacity-50 disabled:cursor-not-allowed
            "
          >
            전송
          </button>
        </div>
      </div>
    </div>
  );
}
