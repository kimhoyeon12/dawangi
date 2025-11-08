"""
FastAPI 메인 서버
다왕이 챗봇 백엔드 API
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict
from router_service import router_service
from data_loader import load_config, load_program_catalog
import uuid
from datetime import datetime, timedelta

app = FastAPI(
    title="다왕이 챗봇 API",
    description="충북대학교 다(부)전공 안내 챗봇 백엔드",
    version="1.0.0"
)

# CORS 설정 (프론트엔드와 통신)
# 배포 환경에서는 모든 origin 허용 (프로덕션에서는 특정 도메인으로 제한 권장)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 배포용: 모든 도메인 허용
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 메모리 기반 세션 스토어 (서버 재시작 시 초기화됨)
# 형식: { session_id: { "history": [...], "profile": {...}, "last_accessed": datetime } }
session_store: Dict[str, dict] = {}

# 요청 모델
class ChatRequest(BaseModel):
    question: str
    profile_dept: Optional[str] = ""
    selected_program: Optional[str] = ""
    program_name: Optional[str] = None
    session_id: Optional[str] = None  # 대화 이력을 위한 세션 ID

class RouterRequest(BaseModel):
    question: str
    profile_dept: Optional[str] = ""
    selected_program: Optional[str] = ""

# 응답 모델
class ChatResponse(BaseModel):
    answer: str
    label: str
    emotion: str
    success: bool
    session_id: str  # 대화 이력을 위한 세션 ID

class ProgramInfo(BaseModel):
    name: str
    type: str

class ProgramCatalogResponse(BaseModel):
    programs: List[ProgramInfo]

# API 엔드포인트
@app.get("/")
def root():
    """API 상태 확인"""
    return {
        "message": "다왕이 챗봇 API 서버가 정상 작동 중이다왕!",
        "version": "1.0.0",
        "status": "healthy"
    }

@app.get("/health")
def health_check():
    """헬스 체크"""
    return {"status": "ok"}

@app.post("/api/chat", response_model=ChatResponse)
def chat(request: ChatRequest):
    """
    챗봇 질문 응답 API

    전체 파이프라인 실행:
    1. 세션 관리 (대화 이력)
    2. 질문 분류 (라우팅)
    3. 적절한 프롬프트 + 데이터 로드
    4. LLM 호출
    5. 답변 반환
    6. 대화 이력 업데이트
    """
    try:
        # 세션 ID 처리
        session_id = request.session_id or str(uuid.uuid4())

        # 세션 가져오기 또는 생성
        if session_id not in session_store:
            session_store[session_id] = {
                "history": [],
                "profile": {
                    "dept": request.profile_dept or "",
                    "selected_program": request.selected_program or ""
                },
                "last_accessed": datetime.now()
            }

        # 기존 세션 정보 업데이트
        session = session_store[session_id]
        session["last_accessed"] = datetime.now()

        # 프로필 정보 업데이트 (새로운 정보가 있으면)
        if request.profile_dept:
            session["profile"]["dept"] = request.profile_dept
        if request.selected_program:
            session["profile"]["selected_program"] = request.selected_program

        # 대화 이력 가져오기
        chat_history = session["history"]

        # 챗봇 파이프라인 실행 (대화 이력 포함)
        result = router_service.chatbot_pipeline(
            question=request.question,
            profile_dept=session["profile"]["dept"],
            selected_program=session["profile"]["selected_program"],
            program_name=request.program_name,
            chat_history=chat_history  # 대화 이력 전달
        )

        # 대화 이력 업데이트
        session["history"].append({
            "role": "user",
            "content": request.question
        })
        session["history"].append({
            "role": "assistant",
            "content": result["answer"]
        })

        # 이력이 너무 길면 최근 10개만 유지
        if len(session["history"]) > 20:  # 10턴 (user + assistant = 2개)
            session["history"] = session["history"][-20:]

        # 응답에 session_id 추가
        result["session_id"] = session_id

        return ChatResponse(**result)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"서버 오류: {str(e)}")

@app.post("/api/route")
def route_question(request: RouterRequest):
    """
    질문 분류 API

    질문을 4개 카테고리 중 하나로 분류
    """
    try:
        label = router_service.route_question(
            question=request.question,
            profile_dept=request.profile_dept or "",
            selected_program=request.selected_program or ""
        )

        return {
            "label": label,
            "success": label != "Unmatched"
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"서버 오류: {str(e)}")

@app.get("/api/programs/available")
def get_available_programs():
    """
    사용 가능한 전공 목록 조회

    상세 교과과정이 제공되는 7개 전공
    """
    try:
        config = load_config()
        programs = config["routing"]["융합전공_교과과정"]["available_programs"]

        # 전공명 한글로 변환
        program_names = []
        name_map = {
            "빅데이터_전공": "빅데이터",
            "지식재산_스마트융합": "지식재산 스마트융합",
            "위기관리_전공": "위기관리",
            "보안컨설팅_전공": "보안컨설팅",
            "벤처비즈니스_전공": "벤처비즈니스",
            "이차전지_융합전공": "이차전지융합",
            "공공데이터사이언스_전공": "공공데이터사이언스"
        }

        for prog_id in programs:
            program_names.append({
                "id": prog_id,
                "name": name_map.get(prog_id, prog_id),
                "type": "융합전공"
            })

        return {"programs": program_names}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"서버 오류: {str(e)}")

@app.get("/api/programs/catalog", response_model=ProgramCatalogResponse)
def get_program_catalog():
    """
    전체 전공 현황 조회

    30개 융합전공 + 2개 연계전공
    """
    try:
        catalog = load_program_catalog()
        return ProgramCatalogResponse(**catalog)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"서버 오류: {str(e)}")

@app.get("/api/config")
def get_config():
    """설정 정보 조회"""
    try:
        config = load_config()
        return config

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"서버 오류: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    import sys
    import io

    # Windows 환경에서 한글 및 이모지 출력 문제 해결
    if sys.platform == 'win32':
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
        sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

    print("\n" + "="*50)
    print("다왕이 챗봇 API 서버 시작 중...")
    print("="*50 + "\n")
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=False)
