import { create } from 'zustand'

interface DayState {
  currentDayId: string | null
  currentDate: string | null
  setCurrentDay: (dayId: string | null, date: string | null) => void
  clearCurrentDay: () => void
}

export const useDayStore = create<DayState>((set) => ({
  currentDayId: null,
  currentDate: null,
  setCurrentDay: (dayId, date) => set({ currentDayId: dayId, currentDate: date }),
  clearCurrentDay: () => set({ currentDayId: null, currentDate: null }),
}))