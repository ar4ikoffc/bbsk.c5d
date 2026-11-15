import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Search, Loader2, AlertTriangle, Bell, CheckCircle, XCircle, RotateCcw } from 'lucide-react'
import { usePlan, useDay } from '@/hooks/useApi'
import { format } from 'date-fns'
import { cn } from '@/utils/cn'

const ALERT_TYPES = ['LATE_RISK', 'PGP_DETECTED', 'STAFF_UNAVAILABLE', 'ORDER_UNASSIGNED', 'CAPACITY_EXCEEDED', 'ROUTE_OPTIMIZATION']

export const AlertsPage = () => {
  const [selectedDate, setSelectedDate] = useState(() => format(new Date(), 'yyyy-MM-dd'))
  const [typeFilter, setTypeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const { data: plan } = usePlan(selectedDate)
  const { data: dayData } = useDay(selectedDate)

  const allAlerts = plan?.alerts || []

  const filteredAlerts = allAlerts.filter((alert: any) => {
    if (typeFilter && alert.type !== typeFilter) return false
    if (statusFilter && alert.status !== statusFilter) return false
    return true
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Алерты и уведомления</h1>
          <p className="text-muted-foreground">Системные алерты о рисках, проблемах и событиях, требующих внимания диспетчера</p>
        </div>
        <div className="flex items-center gap-4">
          <label className="text-sm text-muted-foreground">Дата:</label>
          <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="rounded-md border border-input bg-background px-3 py-2 text-sm w-[180px]" />
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle>Алерты ({filteredAlerts.length} / {allAlerts.length})</CardTitle>
            <div className="flex items-center gap-2 flex-wrap">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[180px]"><SelectValue placeholder="Тип алерта" /></SelectTrigger>
                <SelectContent><SelectItem value="">Все типы</SelectItem>{ALERT_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[160px]"><SelectValue placeholder="Статус" /></SelectTrigger>
                <SelectContent><SelectItem value="">Все</SelectItem><SelectItem value="ACTIVE">Активные</SelectItem><SelectItem value="RESOLVED">Решенные</SelectItem></SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredAlerts.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Алертов не найдено</h3>
              <p className="text-muted-foreground">Для выбранных фильтров алертов нет</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Код</TableHead>
                  <TableHead>Тип</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead>Создан</TableHead>
                  <TableHead>Наряд</TableHead>
                  <TableHead>Сотрудник</TableHead>
                  <TableHead>Действие</TableHead>
                  <TableHead>Сообщение</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAlerts.map((alert: any) => (
                  <TableRow key={alert.id}>
                    <TableCell className="font-mono text-xs">{alert.code}</TableCell>
                    <TableCell><Badge variant="secondary">{alert.type}</Badge></TableCell>
                    <TableCell>
                      <Badge variant={alert.status === 'ACTIVE' ? 'destructive' : 'success'}>{alert.status}</Badge>
                    </TableCell>
                    <TableCell>{format(new Date(alert.createdAt), 'HH:mm:ss')}</TableCell>
                    <TableCell>{alert.orderId?.slice(0, 8)}...</TableCell>
                    <TableCell>{alert.staffId?.slice(0, 8)}...</TableCell>
                    <TableCell>{alert.suggestedAction || '-'}</TableCell>
                    <TableCell className="max-w-[300px] truncate">{alert.message}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {plan && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card><CardHeader className="pb-2"><CardTitle>Всего алертов</CardTitle></CardHeader><CardContent className="text-3xl font-bold">{allAlerts.length}</CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle>Активных</CardTitle></CardHeader><CardContent className="text-3xl font-bold text-destructive">{allAlerts.filter((a: any) => a.status === 'ACTIVE').length}</CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle>Решенных</CardTitle></CardHeader><CardContent className="text-3xl font-bold text-green-500">{allAlerts.filter((a: any) => a.status === 'RESOLVED').length}</CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle>LATE_RISK</CardTitle></CardHeader><CardContent className="text-3xl font-bold text-yellow-500">{allAlerts.filter((a: any) => a.type === 'LATE_RISK').length}</CardContent></Card>
        </div>
      )}
    </div>
  )
}