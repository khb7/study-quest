import { create } from 'zustand';
import type { StudySession } from '@/types';

interface StudyState {
  sessions: StudySession[];
  todayMinutes: number;
  addSession: (session: StudySession) => void;
  clearSessions: () => void;
}

export const useStudyStore = create<StudyState>((set) => ({
  sessions: [],
  todayMinutes: 0,
  addSession: (session) =>
    set((state) => ({
      sessions: [...state.sessions, session],
      todayMinutes: state.todayMinutes + session.durationMinutes,
    })),
  clearSessions: () =>
    set({ sessions: [], todayMinutes: 0 }),
}));
