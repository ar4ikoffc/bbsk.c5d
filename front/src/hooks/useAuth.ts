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
      const user = response.data
      // Backend returns { id, username, role, token } or { accessToken, user }
      const token = response.data.token || response.data.accessToken
      setUser({ ...user, token })
      navigate('/')
    },
  })
}

export const useRegister = () => {
  const navigate = useNavigate()
  const setUser = useAuthStore((state) => state.setUser)

  return useMutation({
    mutationFn: (data: { username: string; password: string; role: string }) => authApi.register(data),
    onSuccess: (response) => {
      const user = response.data
      const token = response.data.token || response.data.accessToken
      setUser({ ...user, token })
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
  const currentUser = useAuthStore((state) => state.user)
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
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  })

  useEffect(() => {
    if (query.data) {
      // Preserve token from store, only update user info from /me
      setUser({ ...query.data, token: currentUser?.token })
    }
    const axiosError = query.error as { response?: { status: number } } | null
    if (axiosError && axiosError.response?.status === 401) {
      setUser(null)
      queryClient.removeQueries({ queryKey: ['auth', 'me'] })
    }
  }, [query.data, query.error, setUser, queryClient, currentUser])

  return query
}