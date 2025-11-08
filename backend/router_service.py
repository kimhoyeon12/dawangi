"""
라우터 서비스
질문을 분류하고 적절한 핸들러로 라우팅
"""
import re
from typing import Tuple, Optional
from data_loader import load_file, get_prompt_and_data
from llm_client import claude_client

class RouterService:
    def __init__(self):
        self.router_prompt_template = load_file("prompt/prompt_multi_routing.txt")

    def route_question(
        self,
        question: str,
        profile_dept: str = "",
        selected_program: str = ""
    ) -> str:
        """
        질문을 4개 카테고리 중 하나로 분류

        Args:
            question: 사용자 질문
            profile_dept: 사용자 소속 학과
            selected_program: 선택된 전공

        Returns:
            라벨 (다전공_제도, 전공_현황, 융합전공_졸업요건, 융합전공_교과과정, Unmatched)
        """
        # 프롬프트 변수 치환
        router_prompt = self.router_prompt_template.replace("{{profile_dept}}", profile_dept)
        router_prompt = router_prompt.replace("{{selected_program}}", selected_program)
        router_prompt = router_prompt.replace("{{QUESTION}}", question)

        # LLM 호출
        response = claude_client.call_router(router_prompt)

        # <output>라벨</output> 파싱
        match = re.search(r'<output>(.+?)</output>', response)
        if match:
            label = match.group(1).strip()
            # 유효한 라벨인지 확인
            valid_labels = ["다전공_제도", "전공_현황", "융합전공_졸업요건", "융합전공_교과과정", "Unmatched"]
            if label in valid_labels:
                return label

        return "Unmatched"

    def generate_answer(
        self,
        question: str,
        label: str,
        profile_dept: str = "",
        selected_program: str = "",
        program_name: Optional[str] = None,
        chat_history: list = None
    ) -> Tuple[str, str]:
        """
        선택된 카테고리로 답변 생성

        Args:
            question: 사용자 질문
            label: 라우팅 라벨
            profile_dept: 사용자 소속 학과
            selected_program: 선택된 전공
            program_name: 전공명 (융합전공_교과과정인 경우)
            chat_history: 대화 이력

        Returns:
            (answer, emotion) 튜플
            - answer: LLM 생성 답변
            - emotion: 추천 감정 상태 (neutral, joy, embarrassed, proud)
        """
        if chat_history is None:
            chat_history = []

        try:
            # 프롬프트와 데이터 로드
            prompt, _ = get_prompt_and_data(
                label=label,
                program_name=program_name,
                profile_dept=profile_dept,
                selected_program=selected_program,
                question=question
            )

            # LLM 호출 (대화 이력 포함)
            answer = claude_client.call_with_history(prompt, chat_history)

            # 감정 상태 결정
            emotion = self._decide_emotion(answer, label)

            return answer, emotion

        except FileNotFoundError as e:
            error_msg = f"죄송해요, 해당 전공의 상세 정보를 찾을 수 없다왕... 😅\n교무과(043-261-3916, 3984)에 문의해보라왕!"
            return error_msg, "embarrassed"
        except Exception as e:
            error_msg = f"오류가 발생했다왕... 😅 잠시 후 다시 시도해보라왕!\n\n오류: {str(e)}"
            return error_msg, "embarrassed"

    def _decide_emotion(self, answer: str, label: str) -> str:
        """
        답변 내용을 기반으로 감정 상태 결정

        Args:
            answer: LLM 생성 답변
            label: 라우팅 라벨

        Returns:
            감정 상태 (neutral, joy, embarrassed, proud)
        """
        # 답변에 특정 키워드가 있으면 감정 변경
        if "죄송" in answer or "모르" in answer or "찾을 수 없" in answer:
            return "embarrassed"

        if "완료" in answer or "성공" in answer or "잘했" in answer:
            return "proud"

        # 긍정적인 답변
        if "<answer>" in answer and len(answer) > 100:
            return "joy"

        return "neutral"

    def chatbot_pipeline(
        self,
        question: str,
        profile_dept: str = "",
        selected_program: str = "",
        program_name: Optional[str] = None,
        chat_history: list = None
    ) -> dict:
        """
        전체 파이프라인 실행

        Args:
            question: 사용자 질문
            profile_dept: 사용자 소속 학과
            selected_program: 선택된 전공
            program_name: 전공명 (융합전공_교과과정인 경우)
            chat_history: 대화 이력 (list of {role, content})

        Returns:
            {
                "answer": str,
                "label": str,
                "emotion": str,
                "success": bool
            }
        """
        if chat_history is None:
            chat_history = []
        # Step 1: 라우팅
        label = self.route_question(question, profile_dept, selected_program)

        if label == "Unmatched":
            return {
                "answer": "죄송해요, 저는 충북대 다(부)전공 안내만 도와드릴 수 있어요. 😅",
                "label": "Unmatched",
                "emotion": "embarrassed",
                "success": False
            }

        # Step 2: 답변 생성
        # 융합전공_교과과정인 경우 program_name 필요
        if label == "융합전공_교과과정" and not program_name:
            # 질문에서 전공명 추출 시도
            program_name = self._extract_program_name(question)
            if not program_name:
                return {
                    "answer": "어떤 전공에 대해 궁금한지 알려주라왕! 😊\n(빅데이터, 지식재산 스마트융합, 위기관리, 보안컨설팅, 벤처비즈니스, 이차전지융합, 공공데이터사이언스)",
                    "label": label,
                    "emotion": "neutral",
                    "success": False
                }

        answer, emotion = self.generate_answer(
            question=question,
            label=label,
            profile_dept=profile_dept,
            selected_program=selected_program,
            program_name=program_name,
            chat_history=chat_history
        )

        # 다왕 말투 적용
        answer = self._apply_dawangi_tone(answer)

        return {
            "answer": answer,
            "label": label,
            "emotion": emotion,
            "success": True
        }

    def _extract_program_name(self, question: str) -> Optional[str]:
        """질문에서 전공명 추출"""
        available_programs = [
            "빅데이터_전공",
            "지식재산_스마트융합",
            "위기관리_전공",
            "보안컨설팅_전공",
            "벤처비즈니스_전공",
            "이차전지_융합전공",
            "공공데이터사이언스_전공"
        ]

        # 키워드 매칭
        keywords_map = {
            "빅데이터": "빅데이터_전공",
            "지식재산": "지식재산_스마트융합",
            "스마트융합": "지식재산_스마트융합",
            "위기관리": "위기관리_전공",
            "보안컨설팅": "보안컨설팅_전공",
            "보안": "보안컨설팅_전공",
            "벤처비즈니스": "벤처비즈니스_전공",
            "벤처": "벤처비즈니스_전공",
            "이차전지": "이차전지_융합전공",
            "공공데이터사이언스": "공공데이터사이언스_전공",
            "공공데이터": "공공데이터사이언스_전공"
        }

        for keyword, program in keywords_map.items():
            if keyword in question:
                return program

        return None

    def _apply_dawangi_tone(self, text: str) -> str:
        """
        다왕 말투 적용
        문장 끝에 랜덤으로 ~다왕, ~왕, ~우왕 추가
        """
        import random

        suffixes = ['다왕', '왕', '우왕']

        # <answer> 블록 외부에는 적용하지 않음
        if '<answer>' not in text:
            return text

        # 간단하게 마지막 문장에만 적용
        if text.endswith('.') or text.endswith('!') or text.endswith('?'):
            suffix = random.choice(suffixes)
            # 이미 다왕 말투가 있으면 추가하지 않음
            if not any(s in text[-10:] for s in suffixes):
                text = text[:-1] + f" {suffix}!"

        return text

# 싱글톤 인스턴스
router_service = RouterService()
