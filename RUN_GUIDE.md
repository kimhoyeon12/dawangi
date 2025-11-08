# 다왕이 챗봇 실행 가이드

충북대학교 다(부)전공 안내 챗봇 "다왕이"를 로컬 환경에서 실행하는 방법입니다.

---

## 📋 사전 요구사항

- **Python 3.10 이상**
- **Node.js 18 이상**
- **npm 또는 yarn**

---

## 🚀 1단계: 백엔드 실행

### 1-1. Python 가상환경 생성 (권장)

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# Mac/Linux
source venv/bin/activate
```

### 1-2. 의존성 설치

```bash
pip install -r requirements.txt
```

### 1-3. 환경 변수 확인

`backend/.env` 파일에 API 키가 올바르게 설정되어 있는지 확인하세요:

```
ANTHROPIC_API_KEY=sk-ant-api03-...
```

### 1-4. 백엔드 서버 실행

```bash
python app.py
```

또는

```bash
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

**서버가 시작되면:**
- 백엔드 API: http://localhost:8000
- API 문서: http://localhost:8000/docs

---

## 🎨 2단계: 프론트엔드 실행

### 2-1. 의존성 설치

새 터미널을 열고:

```bash
cd frontend
npm install
```

### 2-2. 다왕 아바타 이미지 추가

`frontend/public/assets/dawangi/` 폴더에 다음 이미지를 추가하세요:

- `기본.png` (neutral)
- `기쁨.png` (joy)
- `당황.png` (embarrassed)
- `뿌듯.png` (proud)

**이미지가 없는 경우:**
- 임시로 아무 PNG 이미지를 복사하여 이름을 변경
- 또는 플레이스홀더 이미지 다운로드

### 2-3. 프론트엔드 서버 실행

```bash
npm run dev
```

**서버가 시작되면:**
- 프론트엔드: http://localhost:5173

---

## ✅ 3단계: 접속 및 테스트

1. 브라우저에서 **http://localhost:5173** 접속
2. "시작하기" 버튼 클릭
3. 전공 유형 선택 (예: 융합전공)
4. 소속 학과 선택 (예: 소프트웨어학과)
5. 전공 목록에서 원하는 전공 선택
6. 챗봇에게 질문하기!

### 테스트 질문 예시:

- "빅데이터 전공에서 배우는 과목이 뭐가 있나요?"
- "졸업요건이 어떻게 되나요?"
- "복수전공과 융합전공의 차이가 뭔가요?"
- "중복 인정 학점이 몇 학점인가요?"

---

## 🐛 문제 해결

### 백엔드 오류

**`ANTHROPIC_API_KEY not found`**
- `backend/.env` 파일에 API 키가 올바르게 설정되었는지 확인

**`FileNotFoundError`**
- `config.json`, `prompt/`, `data/` 폴더가 프로젝트 루트에 있는지 확인

**포트 충돌**
```bash
# 다른 포트로 실행
uvicorn app:app --reload --port 8001
```

### 프론트엔드 오류

**의존성 설치 실패**
```bash
# 캐시 삭제 후 재설치
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

**API 연결 실패**
- 백엔드 서버가 실행 중인지 확인 (http://localhost:8000/health)
- CORS 설정 확인

**이미지가 보이지 않음**
- `frontend/public/assets/dawangi/` 폴더에 4개의 PNG 파일이 있는지 확인
- 파일명이 정확한지 확인 (기본.png, 기쁨.png, 당황.png, 뿌듯.png)

---

## 📁 프로젝트 구조

```
다(부)전공 챗봇/
├── backend/                    # FastAPI 백엔드
│   ├── app.py                  # 메인 API 서버
│   ├── router_service.py       # 라우팅 로직
│   ├── llm_client.py           # Claude API 클라이언트
│   ├── data_loader.py          # 데이터 로더
│   ├── requirements.txt        # Python 의존성
│   └── .env                    # API 키
├── frontend/                   # React 프론트엔드
│   ├── src/
│   │   ├── pages/              # 5개 페이지
│   │   ├── components/         # 공통 컴포넌트
│   │   ├── stores/             # 상태 관리 (Zustand)
│   │   ├── utils/              # 유틸리티 함수
│   │   ├── App.tsx             # 라우팅
│   │   └── main.tsx            # 진입점
│   ├── public/
│   │   └── assets/dawangi/     # 다왕 이미지
│   └── package.json
├── config.json                 # 라우팅 설정
├── prompt/                     # 프롬프트 파일들
├── data/                       # 데이터 파일들
└── RUN_GUIDE.md               # 이 파일
```

---

## 🎯 주요 기능

### 백엔드 (FastAPI)
- **라우팅**: 질문을 4개 카테고리로 자동 분류
- **LLM 통합**: Claude API 호출 및 응답 생성
- **데이터 로딩**: MD 파일 동적 로드 및 프롬프트 주입
- **감정 상태**: 응답에 따른 감정 추천

### 프론트엔드 (React)
- **5개 페이지**: 시작 → 전공선택 → 소속선택 → 목록 → 챗봇
- **다왕 아바타**: 4가지 감정 상태 (기본, 기쁨, 당황, 뿌듯)
- **실시간 챗봇**: 스트리밍 느낌의 대화형 UI
- **퀵 키워드**: 자주 묻는 질문 바로가기
- **플로팅 버튼**: 전역에서 챗봇 접근 가능

---

## 📞 문의

- 교무과: 043-261-3916, 3984
- 프로젝트 버전: 1.0.0
- 데이터 기준: 2025년 6월

---

## 🔧 개발 환경 정보

- **백엔드**: Python 3.10+, FastAPI, Anthropic Claude API
- **프론트엔드**: React 18, TypeScript, Vite, Tailwind CSS
- **상태 관리**: Zustand
- **라우팅**: React Router v6

---

즐거운 개발 되세요! 🎓
