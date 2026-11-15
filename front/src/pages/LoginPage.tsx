import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { useLogin, useRegister } from '@/hooks/useAuth'
import { AlertCircle, Loader2 } from 'lucide-react'

const loginSchema = z.object({
  username: z.string().min(1, 'Имя пользователя обязательно'),
  password: z.string().min(1, 'Пароль обязателен'),
})

const registerSchema = z.object({
  username: z.string().min(3, 'Минимум 3 символа'),
  password: z.string().min(6, 'Минимум 6 символов'),
  role: z.enum(['DISPATCHER', 'ADMIN'], { required_error: 'Выберите роль' }),
})

type LoginForm = z.infer<typeof loginSchema>
type RegisterForm = z.infer<typeof registerSchema>

export const LoginPage = () => {
  const navigate = useNavigate()
  const [isRegister, setIsRegister] = useState(false)
  const [error, setError] = useState('')

  const login = useLogin()
  const register = useRegister()

  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: '', password: '' },
  })

  const registerForm = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { username: '', password: '', role: 'DISPATCHER' },
  })

  const onLoginSubmit = (data: LoginForm) => {
    setError('')
    login.mutate(data, {
      onError: (err: any) => {
        setError(err.response?.data?.message || 'Неверные учетные данные')
      },
    })
  }

  const onRegisterSubmit = (data: RegisterForm) => {
    setError('')
    register.mutate(data, {
      onError: (err: any) => {
        setError(err.response?.data?.message || 'Ошибка регистрации')
      },
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">BBSK</CardTitle>
          <CardDescription>Диспетчеризация выездных бригад</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={isRegister ? registerForm.handleSubmit(onRegisterSubmit) : loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Имя пользователя</Label>
              <Input
                id="username"
                {...(isRegister ? registerForm.register('username') : loginForm.register('username'))}
                placeholder="Введите имя пользователя"
                disabled={login.isPending || register.isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Пароль</Label>
              <Input
                id="password"
                type="password"
                {...(isRegister ? registerForm.register('password') : loginForm.register('password'))}
                placeholder="Введите пароль"
                disabled={login.isPending || register.isPending}
              />
            </div>

            {isRegister && (
              <div className="space-y-2">
                <Label htmlFor="role">Роль</Label>
                <select
                  id="role"
                  {...registerForm.register('role')}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  disabled={register.isPending}
                >
                  <option value="DISPATCHER">Диспетчер</option>
                  <option value="ADMIN">Администратор</option>
                </select>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={login.isPending || register.isPending}>
              {login.isPending || register.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isRegister ? 'Регистрация...' : 'Вход...'}
                </>
              ) : (
                isRegister ? 'Зарегистрироваться' : 'Войти'
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            {isRegister ? 'Уже есть аккаунт? ' : 'Нет аккаунта? '}
            <Button
              variant="ghost"
              className="p-0 ml-1 text-primary hover:text-primary/80"
              onClick={() => { setIsRegister(!isRegister); setError(''); loginForm.reset(); registerForm.reset(); }}
            >
              {isRegister ? 'Войти' : 'Зарегистрироваться'}
            </Button>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}