import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { staffApi, buildingsApi, workTypesApi, referenceApi, ordersApi, daysApi } from '@/api/client'
import type { Staff, StaffCreateRequest, Shift, ShiftCreateRequest } from '@/types/api'

// Staff hooks
export const useStaff = (params?: { profile?: string; technology?: string; serviceCenterId?: string }) => {
  return useQuery({
    queryKey: ['staff', params],
    queryFn: async () => {
      const response = await staffApi.list(params)
      return response.data
    },
  })
}

export const useStaffItem = (id: string) => {
  return useQuery({
    queryKey: ['staff', id],
    queryFn: async () => {
      const response = await staffApi.get(id)
      return response.data
    },
    enabled: !!id,
  })
}

export const useCreateStaff = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: StaffCreateRequest) => staffApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] })
    },
  })
}

export const useUpdateStaff = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<StaffCreateRequest> }) => staffApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] })
    },
  })
}

export const useDeleteStaff = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => staffApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] })
    },
  })
}

// Shifts hooks
export const useShifts = () => {
  return useQuery({
    queryKey: ['shifts'],
    queryFn: async () => {
      const response = await staffApi.shifts.list()
      return response.data
    },
  })
}

export const useCreateShift = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: ShiftCreateRequest) => staffApi.shifts.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shifts'] })
    },
  })
}

export const useDeleteShift = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => staffApi.shifts.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shifts'] })
    },
  })
}

// Buildings hooks
export const useBuildings = (params?: { buildingType?: string; accessNodeId?: string; serviceCenterId?: string }) => {
  return useQuery({
    queryKey: ['buildings', params],
    queryFn: async () => {
      const response = await buildingsApi.list(params)
      return response.data
    },
  })
}

export const useBuildingsItem = (id: string) => {
  return useQuery({
    queryKey: ['buildings', id],
    queryFn: async () => {
      const response = await buildingsApi.get(id)
      return response.data
    },
    enabled: !!id,
  })
}

export const useCreateBuilding = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: any) => buildingsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buildings'] })
    },
  })
}

// Access Nodes hooks
export const useAccessNodes = (params?: { technology?: string }) => {
  return useQuery({
    queryKey: ['accessNodes', params],
    queryFn: async () => {
      const response = await buildingsApi.accessNodes.list(params)
      return response.data
    },
  })
}

export const useCreateAccessNode = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: any) => buildingsApi.accessNodes.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accessNodes'] })
    },
  })
}

// Service Centers hooks
export const useServiceCenters = () => {
  return useQuery({
    queryKey: ['serviceCenters'],
    queryFn: async () => {
      const response = await buildingsApi.serviceCenters.list()
      return response.data
    },
  })
}

export const useCreateServiceCenter = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: any) => buildingsApi.serviceCenters.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['serviceCenters'] })
    },
  })
}

// Work Types hooks
export const useWorkTypes = () => {
  return useQuery({
    queryKey: ['workTypes'],
    queryFn: async () => {
      const response = await workTypesApi.list()
      return response.data
    },
  })
}

export const useCreateWorkType = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: any) => workTypesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workTypes'] })
    },
  })
}

// Reference hooks
export const useInitReference = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => referenceApi.init(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] })
      queryClient.invalidateQueries({ queryKey: ['shifts'] })
      queryClient.invalidateQueries({ queryKey: ['serviceCenters'] })
      queryClient.invalidateQueries({ queryKey: ['accessNodes'] })
      queryClient.invalidateQueries({ queryKey: ['buildings'] })
      queryClient.invalidateQueries({ queryKey: ['workTypes'] })
    },
  })
}

export const useInitTravelMatrix = () => {
  return useMutation({
    mutationFn: () => referenceApi.travelMatrix(),
  })
}

// Orders hooks
export const useOrders = (params?: { dayId?: string; date?: string; status?: string; buildingId?: string; workTypeId?: string }) => {
  return useQuery({
    queryKey: ['orders', params],
    queryFn: async () => {
      const response = await ordersApi.list(params)
      return response.data
    },
  })
}

export const useCreateOrder = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: any) => ordersApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    },
  })
}

// Days hooks
export const useDay = (date: string) => {
  return useQuery({
    queryKey: ['day', date],
    queryFn: async () => {
      const response = await daysApi.get(date)
      return response.data
    },
    enabled: !!date,
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 404) return false
      return failureCount < 1
    },
  })
}

export const useInitDay = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ date, data }: { date: string; data: any }) => daysApi.init(date, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['day'] })
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    },
  })
}

export const useCreatePlan = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (date: string) => daysApi.plan.create(date),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plan'] })
      queryClient.invalidateQueries({ queryKey: ['day'] })
    },
  })
}

export const usePlan = (date: string) => {
  return useQuery({
    queryKey: ['plan', date],
    queryFn: async () => {
      const response = await daysApi.plan.get(date)
      return response.data
    },
    enabled: !!date,
  })
}

export const useCreateEvent = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ date, data }: { date: string; data: any }) => daysApi.events.create(date, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plan'] })
      queryClient.invalidateQueries({ queryKey: ['day'] })
    },
  })
}