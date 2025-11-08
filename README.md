# 충북대학교 다(부)전공 챗봇 시스템

융합전공, 연계전공, 복수전공, 부전공 정보를 제공하는 AI 챗봇 시스템입니다.

## 📁 프로젝트 구조

```
다(부)전공 챗봇/
├── config.json                          # 라우팅 설정 파일 ⭐
├── prompt/                              # 프롬프트 파일들
│   ├── prompt_multi_routing.txt         # 라우터 (질문 분류)
│   ├── prompt_policy_common.txt         # 다전공 제도 답변
│   ├── prompt_program_catalog.txt       # 전공 현황 답변
│   ├── prompt_convergence_requirements.txt # 졸업요건 답변
│   └── prompt_convergence_curriculum.txt   # 교과과정 답변
└── data/
    ├── common/                          # 공통 데이터 (3개)
    │   ├── 다(부)전공 안내 및 이수 방법.md
    │   ├── 융합전공_연계전공_현황.md
    │   └── 융합전공_졸업요건.md
    └── majors/                          # 전공별 데이터 (7개)
        ├── 빅데이터_전공_교과과정.md
        ├── 지식재산_스마트융합_교과과정.md
        ├── 위기관리_전공_교과과정.md
        ├── 보안컨설팅_전공_교과과정.md
        ├── 벤처비즈니스_전공_교과과정.md
        ├── 이차전지_융합전공_교과과정.md
        └── 공공데이터사이언스_전공_교과과정.md
```

---

## 🔄 시스템 흐름

```
사용자 질문
    ↓
1️⃣ Router (prompt_multi_routing.txt)
    - 질문을 4개 카테고리로 분류
    - 출력: "다전공_제도" | "전공_현황" | "융합전공_졸업요건" | "융합전공_교과과정"
    ↓
2️⃣ config.json에서 해당 라벨의 프롬프트 + 데이터 경로 가져오기
    ↓
3️⃣ 프롬프트 + MD 데이터 로드
    ↓
4️⃣ LLM 호출
    ↓
5️⃣ 답변 반환
    - 형식: <answer><structured>...</structured><explanation>...</explanation></answer>
```

---

## 💻 백엔드 구현 예시 (Python)

```python
import json
import re

# 1. Config 로드
with open("config.json", "r", encoding="utf-8") as f:
    config = json.load(f)

# 2. 라우터 실행
def route_question(question: str, profile_dept: str = "", selected_program: str = "") -> str:
    """질문을 카테고리로 분류"""
    router_config = config["router"]
    router_prompt = load_file(router_config["prompt"])

    # 프롬프트에 변수 주입
    router_prompt = router_prompt.replace("{{profile_dept}}", profile_dept)
    router_prompt = router_prompt.replace("{{selected_program}}", selected_program)
    router_prompt = router_prompt.replace("{{QUESTION}}", question)

    # LLM 호출
    response = llm_call(router_prompt)

    # <output>라벨</output> 파싱
    match = re.search(r'<output>(.+?)</output>', response)
    return match.group(1) if match else "Unmatched"

# 3. 답변 생성
def generate_answer(question: str, label: str, program_name: str = None) -> str:
    """선택된 카테고리로 답변 생성"""
    route_config = config["routing"][label]

    # 프롬프트 로드
    prompt = load_file(route_config["prompt"])

    # 데이터 로드
    if label == "융합전공_교과과정":
        # 전공별 데이터
        data_path = route_config["data_template"].replace("{program_name}", program_name)
    else:
        # 공통 데이터
        data_path = route_config["data"]

    md_content = load_file(data_path)

    # 프롬프트에 데이터 주입
    # policy_data, catalog_data, requirements, curriculum 등
    prompt = inject_data(prompt, md_content)
    prompt = prompt.replace("{{QUESTION}}", question)

    # LLM 호출
    answer = llm_call(prompt)
    return answer

# 4. 전체 파이프라인
def chatbot_pipeline(question: str, profile_dept: str = "", program_name: str = None):
    # Step 1: 라우팅
    label = route_question(question, profile_dept)

    if label == "Unmatched":
        return "죄송해요, 저는 충북대 다(부)전공 안내만 도와드릴 수 있어요. 😅"

    # Step 2: 답변 생성
    answer = generate_answer(question, label, program_name)
    return answer

# 사용 예시
question = "빅데이터 전공에서 배우는 과목이 뭐가 있나요?"
response = chatbot_pipeline(question, profile_dept="소프트웨어학과", program_name="빅데이터_전공")
print(response)
```

---

## 📋 라우팅 카테고리

| 라벨 | 설명 | 프롬프트 | 데이터 |
|---|---|---|---|
| **다전공_제도** | 제도, 신청, 절차, 자격 | prompt_policy_common.txt | 다(부)전공 안내 및 이수 방법.md |
| **전공_현황** | 전공 목록, 관련학과, 주임교수 | prompt_program_catalog.txt | 융합전공_연계전공_현황.md |
| **융합전공_졸업요건** | 총학점, 전필, 논문/대체 | prompt_convergence_requirements.txt | 융합전공_졸업요건.md |
| **융합전공_교과과정** | 과목, 교과목번호, 타학과 인정 | prompt_convergence_curriculum.txt | majors/{전공명}_교과과정.md (7개) |

---

## 🎯 주요 특징

### 1. 모듈형 구조
- 라우터와 각 카테고리 프롬프트 분리
- 질문 유형별 최적화된 프롬프트 사용
- 토큰 효율적 (필요한 데이터만 주입)

### 2. 일관된 출력 형식
모든 답변은 다음 형식으로 출력됩니다:
```xml
<answer>
  <structured>
    참조 기준: 2024년 7월
    - 항목1: 내용 (문서/페이지)
    - 항목2: 내용 (문서/페이지)
  </structured>
  <explanation>
    학생 관점의 상세 설명 및 실무 팁
  </explanation>
</answer>
```

### 3. 전공별 특수 규정 처리
- **벤처비즈니스**: 중복 인정 9학점 제한
- **위기관리**: 7개 학과 모든 전공과목 인정
- 국책사업 참여 전공: 중복 인정 12학점

---

## 📊 데이터 범위

- **총 융합전공**: 30개
- **연계전공**: 2개
- **상세 교과과정 제공**: 7개 융합전공
  - 빅데이터, 지식재산 스마트융합, 위기관리, 보안컨설팅
  - 벤처비즈니스, 이차전지융합, 공공데이터사이언스

---

## 🔧 유지보수

### 새 전공 추가하기
1. `data/majors/` 에 `{전공명}_교과과정.md` 파일 추가
2. `config.json` 의 `available_programs` 배열에 전공명 추가

### 데이터 업데이트
- MD 파일만 수정하면 자동 반영
- 프롬프트 수정 불필요

---

## 📞 문의

- **교무과**: 043-261-3916, 3984

---

## 📝 버전 정보

- **Version**: 1.0
- **Last Updated**: 2025-01-06
- **Data Base Date**: 2025년 6월
