import { create } from 'zustand';
import type { StudySession } from '@/types';

interface StudyState {
  sessions: StudySession[];
  todayMinutes: number;
  currentSubject: string;
  currentContent: string;
  addSession: (session: StudySession) => void;
  clearSessions: () => void;
}

export const useStudyStore = create<StudyState>((set) => ({
  sessions: [],
  todayMinutes: 0,
  currentSubject: '',
  currentContent: '',
  addSession: (session) =>
    set((state) => ({
      sessions: [...state.sessions, session],
      todayMinutes: state.todayMinutes + session.durationMinutes,
      currentSubject: session.subject,
      currentContent: session.content,
    })),
  clearSessions: () =>
    set({ sessions: [], todayMinutes: 0, currentSubject: '', currentContent: '' }),
}));
