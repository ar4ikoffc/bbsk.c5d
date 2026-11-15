import { LayoutDashboard, MapPin, Users, Building2, ListTodo, Settings, AlertTriangle, Route, Calendar, LogOut, Menu, X, ChevronDown, ChevronRight } from 'lucide-react'
import { cn } from '@/utils/cn'

export const NAV_ITEMS = [
  { label: 'Дашборд', href: '/', icon: LayoutDashboard },
  { label: 'Планирование дня', href: '/day-planning', icon: Calendar },
  { label: 'Карта маршрутов', href: '/map', icon: MapPin },
  { label: 'Наряды', href: '/orders', icon: ListTodo },
  { label: 'Сотрудники', href: '/staff', icon: Users },
  { label: 'Здания', href: '/buildings', icon: Building2 },
  { label: 'Типы работ', href: '/work-types', icon: Settings },
  { label: 'Сервисные центры', href: '/service-centers', icon: Building2 },
  { label: 'Смены', href: '/shifts', icon: Route },
  { label: 'Узлы доступа', href: '/access-nodes', icon: MapPin },
  { label: 'События', href: '/events', icon: AlertTriangle },
  { label: 'PGP группы', href: '/pgp-groups', icon: AlertTriangle },
  { label: 'Алерты', href: '/alerts', icon: AlertTriangle },
] as const

export const SIDEBAR_WIDTH = '260px'
export const SIDEBAR_WIDTH_COLLAPSED = '72px'