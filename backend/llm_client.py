"""
Claude API 클라이언트
Anthropic Claude API를 호출하여 응답 생성
"""
import os
from typing import Optional
from anthropic import Anthropic
from dotenv import load_dotenv

# 환경 변수 로드
load_dotenv()

class ClaudeClient:
    def __init__(self):
        api_key = os.getenv("ANTHROPIC_API_KEY")
        if not api_key:
            raise ValueError("ANTHROPIC_API_KEY not found in environment variables")

        self.client = Anthropic(api_key=api_key)
        self.model = "claude-sonnet-4-20250514"

    def call(
        self,
        prompt: str,
        max_tokens: int = 4096,
        temperature: float = 0.7,
        system: Optional[str] = None
    ) -> str:
        """
        Claude API 호출

        Args:
            prompt: 사용자 프롬프트
            max_tokens: 최대 토큰 수
            temperature: 온도 (0~1)
            system: 시스템 프롬프트

        Returns:
            Claude의 응답 텍스트
        """
        try:
            message = self.client.messages.create(
                model=self.model,
                max_tokens=max_tokens,
                temperature=temperature,
                system=system if system else "You are a helpful assistant for Chungbuk National University multi-major program guidance.",
                messages=[
                    {"role": "user", "content": prompt}
                ]
            )

            # 응답 추출
            response_text = ""
            for block in message.content:
                if hasattr(block, 'text'):
                    response_text += block.text

            return response_text

        except Exception as e:
            print(f"Error calling Claude API: {e}")
            raise

    def call_router(self, prompt: str) -> str:
        """
        라우터 전용 호출 (온도 낮춤, 짧은 응답)

        Returns:
            라우팅 라벨 (다전공_제도, 전공_현황, 융합전공_졸업요건, 융합전공_교과과정, Unmatched)
        """
        response = self.call(
            prompt=prompt,
            max_tokens=100,
            temperature=0.3,
            system="You are a classification router. Return only the exact label inside <output>...</output> tags."
        )

        return response.strip()

    def call_with_history(
        self,
        prompt: str,
        chat_history: list,
        max_tokens: int = 4096,
        temperature: float = 0.7,
        system: Optional[str] = None
    ) -> str:
        """
        대화 이력을 포함한 Claude API 호출

        Args:
            prompt: 현재 사용자 프롬프트 (시스템 프롬프트 + 질문)
            chat_history: 이전 대화 이력 [{"role": "user"/"assistant", "content": "..."}]
            max_tokens: 최대 토큰 수
            temperature: 온도 (0~1)
            system: 시스템 프롬프트

        Returns:
            Claude의 응답 텍스트
        """
        try:
            # 메시지 리스트 구성
            messages = []

            # 이전 대화 이력 추가
            for turn in chat_history:
                messages.append({
                    "role": turn["role"],
                    "content": turn["content"]
                })

            # 현재 질문 추가
            messages.append({
                "role": "user",
                "content": prompt
            })

            # Claude API 호출
            message = self.client.messages.create(
                model=self.model,
                max_tokens=max_tokens,
                temperature=temperature,
                system=system if system else "You are a helpful assistant for Chungbuk National University multi-major program guidance.",
                messages=messages
            )

            # 응답 추출
            response_text = ""
            for block in message.content:
                if hasattr(block, 'text'):
                    response_text += block.text

            return response_text

        except Exception as e:
            print(f"Error calling Claude API with history: {e}")
            raise

# 싱글톤 인스턴스
claude_client = ClaudeClient()
