import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useHealth } from '@/hooks/useHealth'
import { useAuthCheck, useLogout } from '@/hooks/useAuth'
import { useAuthStore } from '@/store/authStore'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { LayoutDashboard, Users, Building2, ListTodo, MapPin, Calendar, AlertTriangle, Loader2, CheckCircle, XCircle, RefreshCw } from 'lucide-react'
import { cn } from '@/utils/cn'

export const DashboardPage = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { data: health, isLoading: healthLoading } = useHealth()
  const { data: authData, isLoading: authLoading } = useAuthCheck()
  const logout = useLogout()

  useEffect(() => {
    if (!authLoading && !authData && user) {
      // Token might be expired
    }
  }, [authData, authLoading, user])

  const stats = [
    { label: 'Сотрудники', value: '—', icon: Users, href: '/staff', color: 'text-blue-500' },
    { label: 'Здания', value: '—', icon: Building2, href: '/buildings', color: 'text-green-500' },
    { label: 'Наряды', value: '—', icon: ListTodo, href: '/orders', color: 'text-orange-500' },
    { label: 'Маршруты', value: '—', icon: MapPin, href: '/map', color: 'text-purple-500' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Дашборд</h1>
          <p className="text-muted-foreground">Обзор системы диспетчеризации выездных бригад</p>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate('/day-planning')}>
            <Calendar className="mr-2 h-4 w-4" />
            Планирование дня
          </Button>
          <Button variant="ghost" onClick={() => logout.mutate()}>
            Выйти
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
              <stat.icon className={cn('h-4 w-4', stat.color)} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">Нажмите для просмотра</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Статус системы
            </CardTitle>
          </CardHeader>
          <CardContent>
            {healthLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <span>Проверка...</span>
              </div>
            ) : health ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>Статус</span>
                  <Badge variant="success">{health.status}</Badge>
                </div>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Команда</span>
                  <span>{health.team}</span>
                </div>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Версия</span>
                  <span>{health.version}</span>
                </div>
              </div>
            ) : (
              <Badge variant="destructive">Недоступно</Badge>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Быстрые действия
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link to="/day-planning" className="block">
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="mr-2 h-4 w-4" />
                Инициализировать день
              </Button>
            </Link>
            <Link to="/map" className="block">
              <Button variant="outline" className="w-full justify-start">
                <MapPin className="mr-2 h-4 w-4" />
                Карта маршрутов
              </Button>
            </Link>
            <Link to="/reference" className="block">
              <Button variant="outline" className="w-full justify-start">
                <RefreshCw className="mr-2 h-4 w-4" />
                Загрузить справочники
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LayoutDashboard className="h-5 w-5 text-primary" />
              Навигация
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link to="/staff" className="block">
              <Button variant="ghost" className="w-full justify-start">
                <Users className="mr-2 h-4 w-4" />
                Сотрудники и смены
              </Button>
            </Link>
            <Link to="/buildings" className="block">
              <Button variant="ghost" className="w-full justify-start">
                <Building2 className="mr-2 h-4 w-4" />
                Инфраструктура
              </Button>
            </Link>
            <Link to="/orders" className="block">
              <Button variant="ghost" className="w-full justify-start">
                <ListTodo className="mr-2 h-4 w-4" />
                Наряды на работы
              </Button>
            </Link>
            <Link to="/work-types" className="block">
              <Button variant="ghost" className="w-full justify-start">
                <AlertTriangle className="mr-2 h-4 w-4" />
                Типы работ
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}