import { useEffect, useMemo } from 'react';
import { useEmotion, type Emotion } from '../stores/emotionStore';

interface DawangiAvatarProps {
  size?: number;
  withFade?: boolean;
  className?: string;
}

// 감정별 이미지 경로 매핑
const srcMap: Record<Emotion, string> = {
  neutral: '/assets/dawangi/기본.png',
  joy: '/assets/dawangi/기쁨.png',
  embarrassed: '/assets/dawangi/당황.png',
  proud: '/assets/dawangi/뿌듯.png',
};

// 감정별 alt 텍스트
const altMap: Record<Emotion, string> = {
  neutral: '다왕 아바타 — 기본',
  joy: '다왕 아바타 — 기쁨',
  embarrassed: '다왕 아바타 — 당황',
  proud: '다왕 아바타 — 뿌듯',
};

export function DawangiAvatar({
  size = 64,
  withFade = true,
  className = '',
}: DawangiAvatarProps) {
  const { emotion } = useEmotion();
  const src = useMemo(() => srcMap[emotion], [emotion]);
  const alt = useMemo(() => altMap[emotion], [emotion]);

  // 이미지 사전 로딩
  useEffect(() => {
    const imgs = Object.values(srcMap).map((s) => {
      const i = new Image();
      i.src = s;
      return i;
    });

    return () => {
      imgs.forEach((i) => {
        i.onload = null;
        i.onerror = null;
      });
    };
  }, []);

  return (
    <img
      src={src}
      width={size}
      height={size}
      alt={alt}
      className={`
        ${withFade ? 'transition-opacity duration-200 ease-out' : ''}
        ${className}
      `}
      style={{ width: size, height: size }}
    />
  );
}
