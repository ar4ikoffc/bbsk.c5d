import { LayoutDashboard, MapPin, ListTodo, Calendar, AlertTriangle, Settings, Zap } from 'lucide-react'

export const NAV_ITEMS = [
  { label: 'Дашборд', href: '/', icon: LayoutDashboard },
  { label: 'Карта маршрутов', href: '/map', icon: MapPin },
  { label: 'Заявки / Наряды', href: '/orders', icon: ListTodo },
  { label: 'План на день', href: '/day-planning', icon: Calendar },
  { label: 'События смены', href: '/events', icon: Zap },
  { label: 'Алерты и PGP', href: '/alerts', icon: AlertTriangle },
  { label: 'Администрирование', href: '/admin', icon: Settings },
] as const

export const SIDEBAR_WIDTH = '260px'
export const SIDEBAR_WIDTH_COLLAPSED = '72px'
