"""
MD 파일 로더 모듈
프롬프트와 데이터 파일을 로드하여 LLM에 주입
"""
import os
import json
from pathlib import Path
from typing import Dict, Optional

# 프로젝트 루트 경로
ROOT_DIR = Path(__file__).parent.parent

def load_file(file_path: str) -> str:
    """파일 내용을 읽어서 반환"""
    full_path = ROOT_DIR / file_path
    if not full_path.exists():
        raise FileNotFoundError(f"File not found: {full_path}")

    with open(full_path, "r", encoding="utf-8") as f:
        return f.read()

def load_config() -> Dict:
    """config.json 파일 로드"""
    config_path = ROOT_DIR / "config.json"
    with open(config_path, "r", encoding="utf-8") as f:
        return json.load(f)

def inject_data_to_prompt(prompt: str, md_content: str, label: str) -> str:
    """
    프롬프트에 MD 데이터를 주입
    각 라벨에 따라 적절한 블록에 주입
    """
    # 라벨별 블록 태그 매핑
    block_map = {
        "다전공_제도": "policy_data",
        "전공_현황": "catalog_data",
        "융합전공_졸업요건": "requirements",
        "융합전공_교과과정": "curriculum"
    }

    block_tag = block_map.get(label, "data")

    # {{참조 파일: ...}} 부분을 실제 MD 내용으로 교체
    if f"<{block_tag}>" in prompt:
        # 블록 내부의 {{참조 파일: ...}} 부분을 찾아서 교체
        import re
        pattern = rf"(<{block_tag}>)(.*?)({{{{참조 파일:.*?}}}})(.*?)(</{block_tag}>)"

        def replacer(match):
            open_tag = match.group(1)
            before = match.group(2)
            after = match.group(4)
            close_tag = match.group(5)
            return f"{open_tag}\n{md_content}\n{close_tag}"

        prompt = re.sub(pattern, replacer, prompt, flags=re.DOTALL)

    return prompt

def get_prompt_and_data(
    label: str,
    program_name: Optional[str] = None,
    profile_dept: str = "",
    selected_program: str = "",
    question: str = ""
) -> tuple[str, str]:
    """
    라벨에 따라 프롬프트와 데이터를 로드하고 병합

    Args:
        label: 라우팅 라벨 (다전공_제도, 전공_현황 등)
        program_name: 전공명 (융합전공_교과과정인 경우 필수)
        profile_dept: 사용자 소속 학과
        selected_program: 선택된 전공
        question: 사용자 질문

    Returns:
        (prompt, data) 튜플
    """
    config = load_config()

    if label not in config["routing"]:
        raise ValueError(f"Invalid label: {label}")

    route_config = config["routing"][label]

    # 프롬프트 로드
    prompt = load_file(route_config["prompt"])

    # 데이터 로드
    if label == "융합전공_교과과정":
        if not program_name:
            raise ValueError("program_name is required for 융합전공_교과과정")
        data_path = route_config["data_template"].replace("{program_name}", program_name)
    else:
        data_path = route_config["data"]

    md_content = load_file(data_path)

    # 프롬프트에 데이터 주입
    prompt = inject_data_to_prompt(prompt, md_content, label)

    # 변수 치환
    prompt = prompt.replace("{{profile_dept}}", profile_dept)
    prompt = prompt.replace("{{selected_program}}", selected_program)
    prompt = prompt.replace("{{program_name}}", program_name or "")
    prompt = prompt.replace("{{program_id}}", program_name or "")
    prompt = prompt.replace("{{QUESTION}}", question)

    # JSON 플레이스홀더 기본값 설정
    prompt = prompt.replace("{{completed_courses_json}}", "[]")
    prompt = prompt.replace("{{eligible_programs_json}}", "[]")
    prompt = prompt.replace("{{entry_year}}", "2024")
    prompt = prompt.replace("{{version}}", "2025-06")

    # 🔍 디버깅 로그
    print(f"\n{'='*80}")
    print(f"🔍 디버깅: 프롬프트 생성 완료")
    print(f"{'='*80}")
    print(f"📌 라벨: {label}")
    print(f"📌 전공명: {program_name or 'N/A'}")
    print(f"📌 로드된 데이터 파일: {data_path}")
    print(f"📌 데이터 파일 크기: {len(md_content)} 글자")
    print(f"📌 최종 프롬프트 크기: {len(prompt)} 글자")

    # 중복 인정 과목 섹션이 있는지 확인
    if "전공간 중복 학점인정 교과목" in md_content:
        print(f"✅ '전공간 중복 학점인정 교과목' 섹션 발견!")
        # 해당 섹션의 위치와 일부 내용 출력
        idx = md_content.find("전공간 중복 학점인정 교과목")
        snippet = md_content[idx:idx+500]
        print(f"📄 섹션 미리보기:\n{snippet}\n...")
    else:
        print(f"❌ '전공간 중복 학점인정 교과목' 섹션 없음")

    # profile_dept가 데이터에 있는지 확인
    if profile_dept and profile_dept in md_content:
        print(f"✅ 사용자 학과 '{profile_dept}' 데이터에서 발견!")
        # 해당 학과 주변 내용 출력
        idx = md_content.find(profile_dept)
        snippet = md_content[max(0, idx-100):idx+200]
        print(f"📄 학과 주변 내용:\n...{snippet}...")
    elif profile_dept:
        print(f"❌ 사용자 학과 '{profile_dept}' 데이터에 없음")

    print(f"{'='*80}\n")

    # 최종 프롬프트를 파일로 저장 (디버깅용)
    debug_dir = ROOT_DIR / "debug_prompts"
    debug_dir.mkdir(exist_ok=True)
    debug_file = debug_dir / f"prompt_{label}_{program_name or 'common'}.txt"
    with open(debug_file, "w", encoding="utf-8") as f:
        f.write(prompt)
    print(f"💾 최종 프롬프트 저장: {debug_file}\n")

    return prompt, md_content

def get_available_programs() -> list[str]:
    """사용 가능한 전공 목록 반환"""
    config = load_config()
    return config["routing"]["융합전공_교과과정"]["available_programs"]

def load_program_catalog() -> Dict:
    """전공 현황 데이터를 파싱하여 반환"""
    md_content = load_file("data/common/융합전공_연계전공_현황.md")

    # 간단한 파싱 (실제로는 더 정교하게 파싱 필요)
    programs = []
    lines = md_content.split('\n')
    current_program = None

    for line in lines:
        line = line.strip()
        if line.startswith('###') and '융합전공' in line:
            if current_program:
                programs.append(current_program)
            program_name = line.replace('###', '').strip()
            current_program = {"name": program_name, "type": "융합전공"}
        elif line.startswith('###') and '연계전공' in line:
            if current_program:
                programs.append(current_program)
            program_name = line.replace('###', '').strip()
            current_program = {"name": program_name, "type": "연계전공"}

    if current_program:
        programs.append(current_program)

    return {"programs": programs}
