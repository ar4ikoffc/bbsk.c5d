import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter } from '@/components/ui/dialog'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Plus, Search, Loader2, RotateCcw, AlertTriangle, Clock, UserMinus, Package, ArrowRight, Trash2 } from 'lucide-react'
import { useCreateEvent, usePlan, useDay, useOrders } from '@/hooks/useApi'
import { format } from 'date-fns'
import { cn } from '@/utils/cn'

const eventSchema = z.object({
  type: z.enum(['ORDER_CANCELLED', 'NEW_ORDER', 'STAFF_UNAVAILABLE', 'ORDER_TRANSFERRED', 'VISIT_DELAYED', 'TIME_TICK']),
  timestamp: z.string().min(1, 'Время обязательно'),
  orderId: z.string().optional(),
  reason: z.string().optional(),
  staffId: z.string().optional(),
})

type EventForm = z.infer<typeof eventSchema>

const EVENT_TYPES = [
  { value: 'ORDER_CANCELLED', label: 'Отмена наряда', icon: Trash2 },
  { value: 'NEW_ORDER', label: 'Новый срочный наряд', icon: Plus },
  { value: 'STAFF_UNAVAILABLE', label: 'Сотрудник недоступен', icon: UserMinus },
  { value: 'ORDER_TRANSFERRED', label: 'Передача наряда в станцию', icon: Package },
  { value: 'VISIT_DELAYED', label: 'Задержка на объекте', icon: Clock },
  { value: 'TIME_TICK', label: 'Продвижение модельного времени', icon: RotateCcw },
]

export const EventsPage = () => {
  const [selectedDate, setSelectedDate] = useState(() => format(new Date(), 'yyyy-MM-dd'))
  const [activeTab, setActiveTab] = useState<string>('create')
  const [dialogOpen, setDialogOpen] = useState(false)

  const { data: plan } = usePlan(selectedDate)
  const { data: dayData } = useDay(selectedDate)
  const { data: orders } = useOrders({ date: selectedDate })
  const createEvent = useCreateEvent()

  const form = useForm<EventForm>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      type: 'ORDER_CANCELLED',
      timestamp: format(new Date(), 'yyyy-MM-dd\'T\'HH:mm'),
      orderId: '',
      reason: '',
      staffId: '',
    },
  })

  const onSubmit = (data: EventForm) => {
    const payload = {
      type: data.type,
      timestamp: data.timestamp,
      orderId: data.orderId || undefined,
      reason: data.reason || undefined,
      staffId: data.staffId || undefined,
    }
    createEvent.mutate({ date: selectedDate, data: payload }, {
      onSuccess: () => {
        setDialogOpen(false)
        form.reset({ type: 'ORDER_CANCELLED', timestamp: format(new Date(), 'yyyy-MM-dd\'T\'HH:mm'), orderId: '', reason: '', staffId: '' })
      },
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">События и перепланирование</h1>
          <p className="text-muted-foreground">Регистрация внешних событий в реальном времени с автоматическим реактивным перепланированием</p>
        </div>
        <div className="flex items-center gap-4">
          <label className="text-sm text-muted-foreground">Дата:</label>
          <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="rounded-md border border-input bg-background px-3 py-2 text-sm w-[180px]" />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="create"><Plus className="mr-2 h-4 w-4" />Создать событие</TabsTrigger>
          <TabsTrigger value="plan">План дня</TabsTrigger>
          <TabsTrigger value="orders">Наряды</TabsTrigger>
        </TabsList>

        <TabsContent value="create">
          <Card>
            <CardHeader><CardTitle>Регистрация события</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Тип события</Label>
                    <Select onValueChange={(value) => form.setValue('type', value as "ORDER_CANCELLED" | "NEW_ORDER" | "STAFF_UNAVAILABLE" | "ORDER_TRANSFERRED" | "VISIT_DELAYED" | "TIME_TICK")}>
                      <SelectTrigger><SelectValue placeholder="Выберите тип" /></SelectTrigger>
                      <SelectContent>
                        {EVENT_TYPES.map(et => <SelectItem key={et.value} value={et.value}>{et.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Время события</Label>
                    <Input type="datetime-local" {...form.register('timestamp')} />
                  </div>
                  <div className="space-y-2">
                    <Label>ID наряда (для ORDER_CANCELLED, NEW_ORDER, ORDER_TRANSFERRED, VISIT_DELAYED)</Label>
                    <Select onValueChange={(value) => form.setValue('orderId', value)}>
                      <SelectTrigger><SelectValue placeholder="Выберите наряд" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Не задан</SelectItem>
                        {orders?.map((o: any) => <SelectItem key={o.id} value={o.id}>{o.code}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>ID сотрудника (для STAFF_UNAVAILABLE)</Label>
                    <Input {...form.register('staffId')} placeholder="UUID сотрудника" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Причина / Комментарий</Label>
                    <Input {...form.register('reason')} placeholder="Причина события" />
                  </div>
                </div>
                <div className="flex justify-end pt-4">
                  <Button type="submit" disabled={createEvent.isPending}>
                    {createEvent.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Отправка...
                      </>
                    ) : (
                      <>
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Зарегистрировать событие
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="plan">
          {plan ? (
            <Card>
              <CardHeader><CardTitle>Текущий план дня</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-4">
                    <Card><CardHeader className="pb-2"><CardTitle>Всего нарядов</CardTitle></CardHeader><CardContent className="text-3xl font-bold">{plan.metrics.totalOrders}</CardContent></Card>
                    <Card><CardHeader className="pb-2"><CardTitle>Назначено</CardTitle></CardHeader><CardContent className="text-3xl font-bold text-green-500">{plan.metrics.assignedOrders}</CardContent></Card>
                    <Card><CardHeader className="pb-2"><CardTitle>Нераспределено</CardTitle></CardHeader><CardContent className="text-3xl font-bold text-destructive">{plan.metrics.unassignedOrders}</CardContent></Card>
                    <Card><CardHeader className="pb-2"><CardTitle>Маршрутов</CardTitle></CardHeader><CardContent className="text-3xl font-bold">{plan.metrics.activeRoutes}</CardContent></Card>
                  </div>
                  {plan.alerts.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Алерты ({plan.alerts.length})</h4>
                      <div className="space-y-2">
                        {plan.alerts.map((alert: any) => (
                          <Card key={alert.id} className="border-l-4 border-destructive"><CardContent className="py-3">
                            <p className="font-medium">{alert.message}</p>
                            <p className="text-sm text-muted-foreground">{alert.type} | {format(new Date(alert.createdAt), 'HH:mm:ss')}</p>
                          </CardContent></Card>
                        ))}
                      </div>
                    </div>
                  )}
                  {plan.unassignedOrders.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Нераспределенные наряды ({plan.unassignedOrders.length})</h4>
                      <div className="space-y-2">
                        {plan.unassignedOrders.map((uo: any) => (
                          <Card key={uo.id} className="border-l-4 border-yellow-500"><CardContent className="py-3">
                            <p className="font-medium">Наряд: {uo.orderId}</p>
                            <p className="text-sm text-muted-foreground">Причина: {uo.reasonText}</p>
                          </CardContent></Card>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card><CardContent className="py-8 text-center text-muted-foreground">План не рассчитан. Перейдите на вкладку «Планирование дня» и постройте план.</CardContent></Card>
          )}
        </TabsContent>

        <TabsContent value="orders">
          <Card>
            <CardHeader><CardTitle>Наряды дня ({orders?.length || 0})</CardTitle></CardHeader>
            <CardContent>
              {orders && orders.length > 0 ? (
                <Table>
                  <TableHeader><TableRow><TableHead>Код</TableHead><TableHead>Здание</TableHead><TableHead>Тип работ</TableHead><TableHead>Слот</TableHead><TableHead>Статус</TableHead><TableHead>АО</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {orders.map((order: any) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-mono">{order.code}</TableCell>
                        <TableCell>{order.buildingId?.slice(0, 8)}...</TableCell>
                        <TableCell>{order.workTypeId?.slice(0, 8)}...</TableCell>
                        <TableCell>{format(new Date(order.slotStart), 'HH:mm')} - {format(new Date(order.slotEnd), 'HH:mm')}</TableCell>
                        <TableCell><Badge variant={order.status === 'ASSIGNED' ? 'success' : order.status === 'COMPLETED' ? 'secondary' : 'default'}>{order.status}</Badge></TableCell>
                        <TableCell className="font-mono text-sm">ONT: {order.requiredOnt}, RTR: {order.requiredRouter}, STB: {order.requiredStb}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">Нарядов на этот день нет</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}