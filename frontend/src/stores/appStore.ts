import { create } from 'zustand';

interface AppState {
  // 사용자 선택 상태
  selectedProgramType: string;  // 복수전공, 융합전공, 부전공, 연계전공
  selectedDepartment: string;   // 사용자 소속 학과
  selectedProgram: string;      // 선택한 전공

  // 상태 업데이트 함수
  setProgramType: (type: string) => void;
  setDepartment: (dept: string) => void;
  setProgram: (program: string) => void;
  reset: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  selectedProgramType: '',
  selectedDepartment: '',
  selectedProgram: '',

  setProgramType: (type) => set({ selectedProgramType: type }),
  setDepartment: (dept) => set({ selectedDepartment: dept }),
  setProgram: (program) => set({ selectedProgram: program }),
  reset: () => set({
    selectedProgramType: '',
    selectedDepartment: '',
    selectedProgram: '',
  }),
}));
