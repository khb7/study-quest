import { create } from 'zustand';
import type { User, Stats } from '@/types';

interface UserState {
  user: User;
  updateStats: (stats: Partial<Stats>) => void;
  updateCurrency: (gold?: number, gems?: number) => void;
  updateNickname: (nickname: string) => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: {
    id: "user-001",
    nickname: "탐험가",
    profileImage: null,
    stats: { INT: 50, STR: 0, END: 10, AGI: 0, CHA: 0 },
    gold: 1200,
    gems: 30,
    level: 7,
    exp: 340,
  },
  updateStats: (stats) =>
    set((state) => ({
      user: {
        ...state.user,
        stats: { ...state.user.stats, ...stats },
      },
    })),
  updateCurrency: (gold, gems) =>
    set((state) => ({
      user: {
        ...state.user,
        gold: gold !== undefined ? gold : state.user.gold,
        gems: gems !== undefined ? gems : state.user.gems,
      },
    })),
  updateNickname: (nickname) =>
    set((state) => ({
      user: { ...state.user, nickname },
    })),
}));
