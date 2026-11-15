import { Link, useNavigate } from 'react-router-dom'
import { useHealth } from '@/hooks/useHealth'
import { useAuthCheck, useLogout } from '@/hooks/useAuth'
import { useAuthStore } from '@/store/authStore'
import { useDayStore } from '@/store/dayStore'
import { useStaff, useBuildings, useOrders, usePlan, useServiceCenters } from '@/hooks/useApi'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { LayoutDashboard, Users, Building2, ListTodo, MapPin, Calendar, AlertTriangle, Loader2, CheckCircle2, Zap, Settings, ArrowRight } from 'lucide-react'
import { cn } from '@/utils/cn'

export const DashboardPage = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { currentDate } = useDayStore()
  const { data: health, isLoading: healthLoading } = useHealth()

  const { data: staffList = [] } = useStaff()
  const { data: buildings = [] } = useBuildings()
  const { data: orders = [] } = useOrders({ date: currentDate })
  const { data: plan } = usePlan(currentDate)
  const { data: serviceCenters = [] } = useServiceCenters()

  const stats = [
    {
      label: 'Инженеры / Бригады',
      value: staffList.length,
      icon: Users,
      href: '/admin',
      color: 'text-blue-500',
      desc: 'Зарегистрировано в системе',
    },
    {
      label: 'Объекты и здания',
      value: buildings.length,
      icon: Building2,
      href: '/admin',
      color: 'text-emerald-500',
      desc: 'МКД и частный сектор',
    },
    {
      label: `Наряды (${currentDate})`,
      value: orders.length,
      icon: ListTodo,
      href: '/orders',
      color: 'text-orange-500',
      desc: plan?.metrics ? `Назначено: ${plan.metrics.assignedOrders}` : 'Всего на дату',
    },
    {
      label: 'Активные маршруты',
      value: plan?.metrics?.activeRoutes ?? plan?.routes?.length ?? 0,
      icon: MapPin,
      href: '/map',
      color: 'text-purple-500',
      desc: 'Построенных маршрутов OSM',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 rounded-xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Добро пожаловать{user ? `, ${user.username}` : ''}!
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Рабочая смена диспетчера: <strong>{currentDate}</strong>. Сервисных центров: {serviceCenters.length}.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => navigate('/map')} className="gap-2 shadow">
            <MapPin className="h-4 w-4" />
            Открыть карту маршрутов
          </Button>
          <Button variant="outline" onClick={() => navigate('/day-planning')}>
            <Calendar className="mr-2 h-4 w-4" />
            План дня
          </Button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link key={stat.label} to={stat.href}>
            <Card className="hover:border-primary/50 transition-colors cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
                <stat.icon className={cn('h-5 w-5', stat.color)} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{stat.desc}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* 3 Columns: System Health, Fast Dispatch Actions, Navigation */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* System Health */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              Статус системы BBSK
            </CardTitle>
          </CardHeader>
          <CardContent>
            {healthLoading ? (
              <div className="flex items-center gap-2 text-sm">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span>Проверка доступности backend...</span>
              </div>
            ) : health ? (
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">API Статус</span>
                  <Badge variant="success">{health.status}</Badge>
                </div>
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Команда</span>
                  <span className="font-medium text-foreground">{health.team}</span>
                </div>
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Версия сервиса</span>
                  <span className="font-mono text-foreground">{health.version}</span>
                </div>
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Решатель (Solver)</span>
                  <Badge variant="outline" className="text-emerald-600 border-emerald-300">
                    Online (Port 8000)
                  </Badge>
                </div>
              </div>
            ) : (
              <Badge variant="destructive">Бэкенд недоступен</Badge>
            )}
          </CardContent>
        </Card>

        {/* Quick Dispatch Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Zap className="h-5 w-5 text-amber-500" />
              Быстрые действия диспетчера
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link to="/map" className="block">
              <Button variant="outline" className="w-full justify-between">
                <span className="flex items-center">
                  <MapPin className="mr-2 h-4 w-4 text-primary" />
                  Карта маршрутов OpenStreetMap
                </span>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </Button>
            </Link>

            <Link to="/orders" className="block">
              <Button variant="outline" className="w-full justify-between">
                <span className="flex items-center">
                  <ListTodo className="mr-2 h-4 w-4 text-primary" />
                  Заявки и наряды на сегодня
                </span>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </Button>
            </Link>

            <Link to="/events" className="block">
              <Button variant="outline" className="w-full justify-between">
                <span className="flex items-center">
                  <Zap className="mr-2 h-4 w-4 text-amber-500" />
                  Регистрация события (отмена/сход)
                </span>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Administration shortcuts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Settings className="h-5 w-5 text-primary" />
              Администрирование и НСИ
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link to="/admin" className="block">
              <Button variant="ghost" className="w-full justify-start text-sm">
                <Users className="mr-2 h-4 w-4 text-blue-500" />
                Сотрудники, смены и квалификации
              </Button>
            </Link>
            <Link to="/admin" className="block">
              <Button variant="ghost" className="w-full justify-start text-sm">
                <Building2 className="mr-2 h-4 w-4 text-emerald-500" />
                Сервисные центры и здания
              </Button>
            </Link>
            <Link to="/admin" className="block">
              <Button variant="ghost" className="w-full justify-start text-sm">
                <Settings className="mr-2 h-4 w-4 text-purple-500" />
                Типы работ и нормативы
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
