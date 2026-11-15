import { useQuery } from '@tanstack/react-query'
import { healthApi } from '@/api/client'

export const useHealth = () => {
  return useQuery({
    queryKey: ['health'],
    queryFn: async () => {
      const response = await healthApi.check()
      return response.data
    },
    refetchInterval: 30000,
  })
}