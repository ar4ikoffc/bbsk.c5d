import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { format } from 'date-fns'

interface DayState {
  currentDayId: string | null
  currentDate: string
  selectedServiceCenterId: string | null
  setCurrentDay: (dayId: string | null, date: string) => void
  setCurrentDate: (date: string) => void
  setSelectedServiceCenterId: (serviceCenterId: string | null) => void
  clearCurrentDay: () => void
}

export const useDayStore = create<DayState>()(
  persist(
    (set) => ({
      currentDayId: null,
      currentDate: format(new Date(), 'yyyy-MM-dd'),
      selectedServiceCenterId: null,
      setCurrentDay: (dayId, date) => set({ currentDayId: dayId, currentDate: date }),
      setCurrentDate: (date) => set({ currentDate: date }),
      setSelectedServiceCenterId: (serviceCenterId) => set({ selectedServiceCenterId: serviceCenterId }),
      clearCurrentDay: () => set({ currentDayId: null, currentDate: format(new Date(), 'yyyy-MM-dd') }),
    }),
    {
      name: 'bbsk-day-store',
      partialize: (state) => ({
        currentDate: state.currentDate,
        selectedServiceCenterId: state.selectedServiceCenterId,
      }),
    }
  )
)
