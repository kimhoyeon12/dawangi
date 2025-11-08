import { ReactNode } from 'react';
import { DawangiAvatar } from './DawangiAvatar';

interface TalkBubbleProps {
  children: ReactNode;
  variant?: 'left' | 'right' | 'neutral';
  tone?: 'primary' | 'info' | 'warning';
  withAvatar?: boolean;
  className?: string;
}

export function TalkBubble({
  children,
  variant = 'left',
  tone = 'info',
  withAvatar = true,
  className = '',
}: TalkBubbleProps) {
  // 스타일 결정
  const getBubbleStyle = () => {
    if (variant === 'right') {
      return 'bg-cbnu-red text-white ml-auto';
    }
    if (tone === 'primary') {
      return 'bg-cbnu-red text-white';
    }
    if (tone === 'warning') {
      return 'bg-yellow-50 text-yellow-900 border border-yellow-200';
    }
    return 'bg-pure-white text-charcoal';
  };

  const bubbleStyle = getBubbleStyle();

  return (
    <div
      className={`
        flex items-start gap-3 max-w-2xl animate-slide-up
        ${variant === 'right' ? 'flex-row-reverse justify-end' : 'justify-start'}
        ${className}
      `}
    >
      {withAvatar && (
        <div className="flex-shrink-0">
          <DawangiAvatar size={48} />
        </div>
      )}

      <div
        className={`
          rounded-2xl p-4 shadow-dawangi relative
          ${bubbleStyle}
          ${variant === 'left' ? 'rounded-tl-sm' : ''}
          ${variant === 'right' ? 'rounded-tr-sm' : ''}
        `}
      >
        {children}
      </div>
    </div>
  );
}
