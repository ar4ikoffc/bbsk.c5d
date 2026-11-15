import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { authApi } from '@/api/client'
import { useAuthStore } from '@/store/authStore'
import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'

export const useLogin = () => {
  const navigate = useNavigate()
  const setUser = useAuthStore((state) => state.setUser)

  return useMutation({
    mutationFn: (data: { username: string; password: string }) => authApi.login(data),
    onSuccess: (response) => {
      const user = response.data?.user || response.data
      setUser(user)
      navigate('/')
    },
  })
}

export const useRegister = () => {
  const navigate = useNavigate()
  const setUser = useAuthStore((state) => state.setUser)

  return useMutation({
    mutationFn: async (data: { username: string; password: string; role: string }) => {
      await authApi.register(data)
      const loginRes = await authApi.login({ username: data.username, password: data.password })
      return loginRes
    },
    onSuccess: (response) => {
      const user = response.data?.user || response.data
      setUser(user)
      navigate('/')
    },
  })
}

export const useLogout = () => {
  const navigate = useNavigate()
  const logout = useAuthStore((state) => state.logout)
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      logout()
      queryClient.clear()
      navigate('/login')
    },
  })
}

export const useAuthCheck = () => {
  const setUser = useAuthStore((state) => state.setUser)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const response = await authApi.me()
      return response.data
    },
    enabled: isAuthenticated,
    retry: false,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  })

  useEffect(() => {
    if (query.data) {
      const current = useAuthStore.getState().user
      if (!current || current.username !== query.data.username || current.role !== query.data.role) {
        setUser({ ...current, ...query.data })
      }
    }
    const axiosError = query.error as { response?: { status: number } } | null
    if (axiosError && axiosError.response?.status === 401) {
      if (useAuthStore.getState().isAuthenticated) {
        setUser(null)
        queryClient.removeQueries({ queryKey: ['auth', 'me'] })
      }
    }
  }, [query.data, query.error, setUser, queryClient])

  return query
}
