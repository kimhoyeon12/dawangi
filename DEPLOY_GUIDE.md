# 🚀 다왕이 챗봇 배포 가이드 (Railway)

## 📋 배포 전 준비사항

### 1. GitHub 계정 및 저장소 생성
1. GitHub(https://github.com) 계정 생성/로그인
2. 새 저장소(Repository) 생성
   - Repository name: `dawangi-chatbot` (원하는 이름)
   - Public 또는 Private 선택
   - **README, .gitignore 체크 해제** (이미 있음)

### 2. GitHub에 코드 업로드

```bash
# 터미널에서 프로젝트 디렉토리로 이동
cd "C:\Users\USER\OneDrive - 충북대학교\바탕 화면\다(부)전공 챗봇"

# GitHub 저장소 연결 (YOUR_USERNAME과 YOUR_REPO를 본인 것으로 변경)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git

# 코드 푸시
git branch -M main
git push -u origin main
```

---

## 🚂 Railway 배포 (무료/가장 쉬움)

### Step 1: Railway 계정 생성
1. https://railway.app 접속
2. "Login with GitHub" 클릭
3. GitHub 계정으로 로그인

### Step 2: Backend 배포

#### 2-1. 새 프로젝트 생성
- Railway 대시보드에서 **"New Project"** 클릭
- **"Deploy from GitHub repo"** 선택
- 본인의 `dawangi-chatbot` 저장소 선택

#### 2-2. Backend 서비스 설정
- 프로젝트가 생성되면 자동으로 배포 시작
- **"Settings"** 탭으로 이동
- **Root Directory** 설정: `backend` 입력
- **Start Command** 설정: `uvicorn app:app --host 0.0.0.0 --port $PORT`

#### 2-3. 환경 변수 설정
- **"Variables"** 탭으로 이동
- **"New Variable"** 클릭
- 다음 변수 추가:
  ```
  ANTHROPIC_API_KEY = your_claude_api_key_here
  ```
  (Claude API 키는 https://console.anthropic.com 에서 발급)

#### 2-4. 도메인 확인
- **"Settings"** → **"Domains"** 에서 Backend URL 확인
- 예: `https://your-app-name.railway.app`
- **이 URL을 복사해두세요!** (Frontend에서 사용)

### Step 3: Frontend 배포

#### 3-1. 같은 프로젝트에 서비스 추가
- 프로젝트 대시보드에서 **"+ New"** 클릭
- **"GitHub Repo"** 선택
- 같은 저장소 선택

#### 3-2. Frontend 서비스 설정
- **"Settings"** 탭으로 이동
- **Root Directory** 설정: `frontend` 입력
- **Build Command** 설정: `npm install && npm run build`
- **Start Command** 설정: `npm run preview`

#### 3-3. 환경 변수 설정
- **"Variables"** 탭으로 이동
- **"New Variable"** 클릭
- 다음 변수 추가:
  ```
  VITE_API_URL = https://your-backend-url.railway.app
  ```
  (Step 2-4에서 복사한 Backend URL)

#### 3-4. 배포 완료
- 빌드가 완료되면 **"Settings"** → **"Domains"** 에서 Frontend URL 확인
- 예: `https://your-frontend-name.railway.app`

---

## ✅ 배포 확인

### Backend 확인
```
https://your-backend-url.railway.app/
```
→ "다왕이 챗봇 API 서버가 정상 작동 중이다왕!" 메시지 확인

### Frontend 확인
```
https://your-frontend-url.railway.app
```
→ 다왕이 챗봇 시작 페이지가 열리면 성공!

---

## 🔧 문제 해결

### 배포 실패 시
1. Railway 대시보드 → "Deployments" 탭에서 로그 확인
2. 빨간색 에러 메시지 확인 후 수정
3. GitHub에 푸시하면 자동으로 재배포됨

### Frontend에서 Backend 연결 안됨
1. Backend URL이 올바른지 확인
2. CORS 설정 확인 (이미 `allow_origins=["*"]`로 설정됨)
3. Railway Variables에서 `VITE_API_URL` 확인

### API 키 관련 에러
- Railway Backend Variables에 `ANTHROPIC_API_KEY` 제대로 입력했는지 확인

---

## 📱 사용자에게 공유

배포 완료 후 Frontend URL을 공유하면 됩니다:
```
https://your-frontend-name.railway.app
```

핸드폰, 태블릿, PC 어디서든 접속 가능합니다!

---

## 💰 비용

Railway 무료 플랜:
- 월 $5 크레딧 제공
- 소규모 프로젝트는 무료로 사용 가능
- 크레딧 소진 시 자동 중지 (결제 없음)

---

## 🔄 코드 수정 후 재배포

1. 로컬에서 코드 수정
2. Git 커밋 & 푸시:
   ```bash
   git add .
   git commit -m "수정 내용"
   git push
   ```
3. Railway가 자동으로 감지하고 재배포!

---

## 📞 도움말

- Railway 공식 문서: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
