import { create } from 'zustand';

export type Emotion = 'neutral' | 'joy' | 'embarrassed' | 'proud';

interface EmotionState {
  emotion: Emotion;
  setEmotion: (emotion: Emotion, reason?: string) => void;
  resetToNeutral: () => void;
}

export const useEmotion = create<EmotionState>((set) => ({
  emotion: 'neutral',
  setEmotion: (emotion, reason) => {
    console.log(`Emotion changed to: ${emotion}${reason ? ` (${reason})` : ''}`);
    set({ emotion });

    // 5초 후 자동으로 neutral로 복귀
    setTimeout(() => {
      set({ emotion: 'neutral' });
    }, 5000);
  },
  resetToNeutral: () => set({ emotion: 'neutral' }),
}));

export function decideEmotionByEvent(evt: 'success' | 'complete' | 'error' | null): Emotion {
  if (evt === 'success') return 'joy';
  if (evt === 'complete') return 'proud';
  if (evt === 'error') return 'embarrassed';
  return 'neutral';
}
