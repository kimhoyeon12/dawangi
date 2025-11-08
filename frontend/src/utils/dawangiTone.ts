/**
 * 다왕 말투 적용 유틸리티
 * 문장 끝에 랜덤으로 ~다왕, ~왕, ~우왕 추가
 */

const suffixes = ['다왕', '왕', '우왕'];

export function applyDawangiTone(text: string, force: boolean = false): string {
  if (!text) return text;

  // 이미 다왕 말투가 있으면 그대로 반환
  if (suffixes.some((suffix) => text.includes(suffix)) && !force) {
    return text;
  }

  // 마지막 문장에 랜덤 어미 추가
  const randomSuffix = suffixes[Math.floor(Math.random() * suffixes.length)];

  // 문장 끝 처리
  if (text.endsWith('.') || text.endsWith('!') || text.endsWith('?')) {
    return text.slice(0, -1) + ` ${randomSuffix}!`;
  }

  return text + ` ${randomSuffix}!`;
}

/**
 * 여러 문장에 다왕 말투 적용
 * 첫 문장과 마지막 문장에는 항상 적용, 중간 문장은 30% 확률
 */
export function applyDawangiToneMultiple(lines: string[]): string[] {
  if (lines.length === 0) return lines;

  return lines.map((line, index) => {
    const isFirst = index === 0;
    const isLast = index === lines.length - 1;

    if (isFirst || isLast) {
      return applyDawangiTone(line, true);
    }

    // 중간 문장은 30% 확률로 적용
    if (Math.random() < 0.3) {
      return applyDawangiTone(line, true);
    }

    return line;
  });
}

/**
 * 환영 메시지 생성
 */
export function getWelcomeMessage(pageName: string): string {
  const messages: Record<string, string> = {
    start: '내게 다 물어봥!',
    programType: '궁금한 전공을 선택해보라왕!',
    department: '소속 학과를 선택해보라왕!',
    programList: '좋은 선택이다왕! 핵심만 알려주겠다왕!',
    chat: '어서와! 내가 다 알려줄거다왕! 걱정하지마왕~',
  };

  return messages[pageName] || '안녕하다왕!';
}
