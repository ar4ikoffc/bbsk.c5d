import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Calendar, Plus, Loader2, Play, AlertTriangle, CheckCircle, XCircle, ArrowRight, Download, Upload } from 'lucide-react'
import { useInitDay, useCreatePlan, usePlan, useDay, useInitReference, useInitTravelMatrix, useOrders } from '@/hooks/useApi'
import { useDayStore } from '@/store/dayStore'
import { format, addDays } from 'date-fns'
import { cn } from '@/utils/cn'

const dayInitSchema = z.object({
  date: z.string().min(1, 'Дата обязательна'),
  now: z.string().min(1, 'Время обязательно'),
  orders: z.array(z.any()),
  absentStaff: z.array(z.string()),
})

type DayInitForm = z.infer<typeof dayInitSchema>

interface OrderForm {
  orderId: string
  buildingId: string
  workType: string
  registeredAt: string
  slotStart: string
  slotEnd: string
  requiredEquipmentOnt: number
  requiredEquipmentRouter: number
  requiredEquipmentStb: number
  isRepeat: boolean
}

export const DayPlanningPage = () => {
  const navigate = useNavigate()
  const [selectedDate, setSelectedDate] = useState(() => format(new Date(), 'yyyy-MM-dd'))
  const [nowTime, setNowTime] = useState(() => format(new Date(), 'yyyy-MM-dd\'T\'HH:mm'))
  const [orders, setOrders] = useState<OrderForm[]>([])
  const [absentStaffCodes, setAbsentStaffCodes] = useState<string>('')
  const [activeTab, setActiveTab] = useState<string>('init')
  const [error, setError] = useState('')

  const { setCurrentDay } = useDayStore()
  const initDay = useInitDay()
  const createPlan = useCreatePlan()
  const { data: plan, isLoading: planLoading } = usePlan(selectedDate)
  const { data: dayData, isLoading: dayLoading, isError: dayError } = useDay(selectedDate)
  const initReference = useInitReference()
  const initTravelMatrix = useInitTravelMatrix()
  const { data: ordersList } = useOrders({ date: selectedDate })

  const form = useForm<DayInitForm>({
    resolver: zodResolver(dayInitSchema),
    defaultValues: {
      date: selectedDate,
      now: nowTime,
      orders: [],
      absentStaff: [],
    },
  })

  const handleDateChange = (date: string) => {
    setSelectedDate(date)
    form.setValue('date', date)
    form.setValue('now', format(new Date(date), 'yyyy-MM-dd\'T\'HH:mm'))
    setActiveTab('init')
  }

  const addOrder = () => {
    const newOrder: OrderForm = {
      orderId: `ORD-${format(new Date(selectedDate), 'yyyyMMdd')}-${String(orders.length + 1).padStart(4, '0')}`,
      buildingId: '',
      workType: '',
      registeredAt: format(new Date(), 'yyyy-MM-dd\'T\'HH:mm'),
      slotStart: format(new Date(selectedDate), 'yyyy-MM-dd\'T\'09:00'),
      slotEnd: format(new Date(selectedDate), 'yyyy-MM-dd\'T\'11:00'),
      requiredEquipmentOnt: 0,
      requiredEquipmentRouter: 1,
      requiredEquipmentStb: 0,
      isRepeat: false,
    }
    setOrders([...orders, newOrder])
  }

  const removeOrder = (index: number) => {
    setOrders(orders.filter((_, i) => i !== index))
  }

  const onSubmit = (data: DayInitForm) => {
    setError('')
    const absentStaff = absentStaffCodes.split(',').map(s => s.trim()).filter(Boolean)
    const ordersPayload = orders.map((o, i) => ({
      orderId: o.orderId || `ORD-${format(new Date(selectedDate), 'yyyyMMdd')}-${String(i + 1).padStart(4, '0')}`,
      buildingId: o.buildingId,
      workType: o.workType,
      registeredAt: o.registeredAt,
      slot: {
        start: o.slotStart,
        end: o.slotEnd,
      },
      requiredEquipment: {
        ONT: o.requiredEquipmentOnt,
        ROUTER: o.requiredEquipmentRouter,
        STB: o.requiredEquipmentStb,
      },
      isRepeat: o.isRepeat,
    }))
    initDay.mutate({ date: selectedDate, data: { ...data, orders: ordersPayload, absentStaff } }, {
      onSuccess: (response) => {
        setCurrentDay(response.data.id, selectedDate)
        setActiveTab('plan')
      },
      onError: (err: any) => {
        setError(err.response?.data?.message || 'Ошибка инициализации дня')
      },
    })
  }

  const handleCreatePlan = () => {
    createPlan.mutate(selectedDate, {
      onSuccess: () => {
        setActiveTab('plan')
      },
      onError: (err: any) => {
        setError(err.response?.data?.message || 'Ошибка построения плана')
      },
    })
  }

  const renderPlan = () => {
    if (planLoading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
    if (!plan) return <div className="text-center py-8 text-muted-foreground">План не рассчитан. Нажмите «Построить план».</div>

    return (
      <Tabs defaultValue="routes" className="space-y-4">
        <TabsList>
          <TabsTrigger value="routes">Маршруты ({plan.routes.length})</TabsTrigger>
          <TabsTrigger value="metrics">Метрики</TabsTrigger>
          <TabsTrigger value="alerts">Алерты ({plan.alerts.length})</TabsTrigger>
          <TabsTrigger value="unassigned">Нераспределенные ({plan.unassignedOrders.length})</TabsTrigger>
          {plan.pgpGroups.length > 0 && <TabsTrigger value="pgp">PGP группы ({plan.pgpGroups.length})</TabsTrigger>}
        </TabsList>

        <TabsContent value="routes">
          <div className="space-y-4">
            {plan.routes.map((route: any) => (
              <Card key={route.routeId}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary">{route.serviceCenterCode}</Badge>
                      <span className="font-medium">{route.staffCode} — {route.staffName}</span>
                      <Badge variant={route.status === 'ACTIVE' ? 'success' : 'default'}>{route.status}</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Нарядов: {route.totalOrders} | Путь: {Math.round(route.totalTravelSec / 60)} мин | Работа: {route.totalWorkMin} мин
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>#</TableHead>
                        <TableHead>Тип</TableHead>
                        <TableHead>Объект / Наряд</TableHead>
                        <TableHead>Прибытие</TableHead>
                        <TableHead>Начало</TableHead>
                        <TableHead>Конец</TableHead>
                        <TableHead>В пути (мин)</TableHead>
                        <TableHead>АО после</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {route.stops.map((stop: any) => (
                        <TableRow key={stop.seq}>
                          <TableCell>{stop.seq}</TableCell>
                          <TableCell>
                            <Badge variant={
                              stop.type === 'DEPOT_START' ? 'secondary' :
                              stop.type === 'DEPOT_END' ? 'secondary' :
                              stop.type === 'VISIT' ? 'success' :
                              stop.type === 'BREAK' ? 'warning' :
                              stop.type === 'RESTOCK' ? 'destructive' : 'default'
                            }>{stop.type}</Badge>
                          </TableCell>
                          <TableCell>{stop.orderId ? `${stop.locationCode} (${stop.orderId})` : stop.locationCode}</TableCell>
                          <TableCell>{format(new Date(stop.arrival), 'HH:mm')}</TableCell>
                          <TableCell>{format(new Date(stop.startTime), 'HH:mm')}</TableCell>
                          <TableCell>{format(new Date(stop.endTime), 'HH:mm')}</TableCell>
                          <TableCell>{Math.round(stop.travelSec / 60)}</TableCell>
                          <TableCell>
                            {stop.equipmentAfterOnt !== null && stop.equipmentAfterRouter !== null && stop.equipmentAfterStb !== null ? (
                              `ONT: ${stop.equipmentAfterOnt}, RTR: ${stop.equipmentAfterRouter}, STB: ${stop.equipmentAfterStb}`
                            ) : (
                              '-'
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="metrics">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2"><CardTitle>Всего нарядов</CardTitle></CardHeader>
              <CardContent className="text-3xl font-bold">{plan.metrics.totalOrders}</CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle>Назначено</CardTitle></CardHeader>
              <CardContent className="text-3xl font-bold text-green-500">{plan.metrics.assignedOrders}</CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle>Нераспределено</CardTitle></CardHeader>
              <CardContent className="text-3xl font-bold text-destructive">{plan.metrics.unassignedOrders}</CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle>PGP нарядов</CardTitle></CardHeader>
              <CardContent className="text-3xl font-bold text-yellow-500">{plan.metrics.pgpOrders}</CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle>Активных маршрутов</CardTitle></CardHeader>
              <CardContent className="text-3xl font-bold">{plan.metrics.activeRoutes}</CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle>Общее время в пути</CardTitle></CardHeader>
              <CardContent className="text-3xl font-bold">{Math.round(plan.metrics.totalTravelSec / 60)} мин</CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="alerts">
          {plan.alerts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">Алертов нет</div>
          ) : (
            <div className="space-y-2">
              {plan.alerts.map((alert: any) => (
                <Card key={alert.id} className="border-l-4 border-destructive">
                  <CardContent className="py-3">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-medium">{alert.message}</p>
                        <p className="text-sm text-muted-foreground">{alert.type} | {format(new Date(alert.createdAt), 'HH:mm:ss')}</p>
                      </div>
                      <Badge variant="destructive">{alert.status}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="unassigned">
          {plan.unassignedOrders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">Все наряды распределены</div>
          ) : (
            <div className="space-y-2">
              {plan.unassignedOrders.map((uo: any) => (
                <Card key={uo.id} className="border-l-4 border-yellow-500">
                  <CardContent className="py-3">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-medium">Наряд: {uo.orderId}</p>
                        <p className="text-sm text-muted-foreground">Причина: {uo.reasonText}</p>
                        <p className="text-sm text-muted-foreground">Действие: {uo.suggestedAction}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="pgp">
          {plan.pgpGroups.map((pgp: any) => (
            <Card key={pgp.id} className="border-l-4 border-orange-500">
              <CardContent className="py-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium">Группа: {pgp.code}</p>
                    <p className="text-sm text-muted-foreground">Узел: {pgp.accessNodeId} | {format(new Date(pgp.detectedAt), 'HH:mm:ss')}</p>
                    <p className="text-sm text-muted-foreground">Действие: {pgp.action}</p>
                  </div>
                  <Badge variant="warning">{pgp.action}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Планирование дня</h1>
          <p className="text-muted-foreground">Инициализация рабочего дня, построение маршрутов и управление нарядами</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => initReference.mutate()} disabled={initReference.isPending}>
            <Upload className="mr-2 h-4 w-4" />
            Загрузить справочники
          </Button>
          <Button variant="outline" onClick={() => initTravelMatrix.mutate()} disabled={initTravelMatrix.isPending}>
            <Download className="mr-2 h-4 w-4" />
            Матрица путей
          </Button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {dayError && (
        <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          <span>День не инициализирован. Заполните параметры и нажмите «Инициализировать день».</span>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="init">1. Инициализация</TabsTrigger>
          <TabsTrigger value="plan" disabled={!dayData}>2. План</TabsTrigger>
          <TabsTrigger value="orders" disabled={!dayData}>Наряды дня</TabsTrigger>
        </TabsList>

        <TabsContent value="init">
          <Card>
            <CardHeader>
              <CardTitle>Параметры дня</CardTitle>
              <CardDescription>Укажите дату, текущее время и наряды на день</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Дата рабочего дня</Label>
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => handleDateChange(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Текущее время (now)</Label>
                  <Input
                    type="datetime-local"
                    value={nowTime}
                    onChange={(e) => setNowTime(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Наряды на день</Label>
                  <Button variant="outline" size="sm" onClick={addOrder}>
                    <Plus className="mr-1 h-4 w-4" />
                    Добавить наряд
                  </Button>
                </div>
                {orders.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                    Нарядов нет. Добавьте первый наряд.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order, index) => (
                      <Card key={index} className="p-4">
                        <div className="flex items-center justify-between mb-4">
                          <span className="font-medium">Наряд #{index + 1}</span>
                          <Button variant="ghost" size="icon" onClick={() => removeOrder(index)}>
                            <XCircle className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                        <div className="grid gap-4 md:grid-cols-4">
                          <div className="space-y-2">
                            <Label>ID наряда</Label>
                            <Input value={order.orderId} onChange={(e) => setOrders(orders.map((o, i) => i === index ? { ...o, orderId: e.target.value } : o))} />
                          </div>
                          <div className="space-y-2">
                            <Label>ID здания</Label>
                            <Input value={order.buildingId} onChange={(e) => setOrders(orders.map((o, i) => i === index ? { ...o, buildingId: e.target.value } : o))} placeholder="B-00001" />
                          </div>
                          <div className="space-y-2">
                            <Label>Тип работ</Label>
                            <Input value={order.workType} onChange={(e) => setOrders(orders.map((o, i) => i === index ? { ...o, workType: e.target.value } : o))} placeholder="INST_PON_MKD" />
                          </div>
                          <div className="space-y-2">
                            <Label>Зарегистрирован</Label>
                            <Input type="datetime-local" value={order.registeredAt} onChange={(e) => setOrders(orders.map((o, i) => i === index ? { ...o, registeredAt: e.target.value } : o))} />
                          </div>
                        </div>
                        <div className="grid gap-4 md:grid-cols-4 mt-4">
                          <div className="space-y-2">
                            <Label>Слот начало</Label>
                            <Input type="datetime-local" value={order.slotStart} onChange={(e) => setOrders(orders.map((o, i) => i === index ? { ...o, slotStart: e.target.value } : o))} />
                          </div>
                          <div className="space-y-2">
                            <Label>Слот конец</Label>
                            <Input type="datetime-local" value={order.slotEnd} onChange={(e) => setOrders(orders.map((o, i) => i === index ? { ...o, slotEnd: e.target.value } : o))} />
                          </div>
                          <div className="space-y-2">
                            <Label>ОНТ</Label>
                            <Input type="number" value={order.requiredEquipmentOnt} onChange={(e) => setOrders(orders.map((o, i) => i === index ? { ...o, requiredEquipmentOnt: parseInt(e.target.value) || 0 } : o))} />
                          </div>
                          <div className="space-y-2">
                            <Label>Роутер</Label>
                            <Input type="number" value={order.requiredEquipmentRouter} onChange={(e) => setOrders(orders.map((o, i) => i === index ? { ...o, requiredEquipmentRouter: parseInt(e.target.value) || 0 } : o))} />
                          </div>
                        </div>
                        <div className="grid gap-4 md:grid-cols-4 mt-4">
                          <div className="space-y-2">
                            <Label>STB</Label>
                            <Input type="number" value={order.requiredEquipmentStb} onChange={(e) => setOrders(orders.map((o, i) => i === index ? { ...o, requiredEquipmentStb: parseInt(e.target.value) || 0 } : o))} />
                          </div>
                          <div className="space-y-2 flex items-end">
                            <Label>Повторный</Label>
                            <Input type="checkbox" checked={order.isRepeat} onChange={(e) => setOrders(orders.map((o, i) => i === index ? { ...o, isRepeat: e.target.checked } : o))} />
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Отсутствующие сотрудники (коды через запятую)</Label>
                <Input
                  value={absentStaffCodes}
                  onChange={(e) => setAbsentStaffCodes(e.target.value)}
                  placeholder="ST-003, ST-015"
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={() => form.handleSubmit(onSubmit)()} disabled={initDay.isPending}>
                {initDay.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Инициализация...
                  </>
                ) : (
                  'Инициализировать день'
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="plan">
          {renderPlan()}
          {!plan && !planLoading && (
            <div className="text-center py-8">
              <Button onClick={handleCreatePlan} disabled={createPlan.isPending} size="lg">
                {createPlan.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Построение...
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Построить план (запустить оптимизатор)
                  </>
                )}
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>Наряды дня</CardTitle>
            </CardHeader>
            <CardContent>
              {ordersList && ordersList.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Код</TableHead>
                      <TableHead>Здание</TableHead>
                      <TableHead>Тип работ</TableHead>
                      <TableHead>Слот</TableHead>
                      <TableHead>Статус</TableHead>
                      <TableHead>АО</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ordersList.map((order: any) => (
                      <TableRow key={order.id}>
                        <TableCell>{order.id.slice(0, 8)}...</TableCell>
                        <TableCell className="font-mono">{order.code}</TableCell>
                        <TableCell>{order.buildingId?.slice(0, 8)}...</TableCell>
                        <TableCell>{order.workTypeId?.slice(0, 8)}...</TableCell>
                        <TableCell>{format(new Date(order.slotStart), 'HH:mm')} - {format(new Date(order.slotEnd), 'HH:mm')}</TableCell>
                        <TableCell><Badge variant={order.status === 'ASSIGNED' ? 'success' : order.status === 'COMPLETED' ? 'secondary' : 'default'}>{order.status}</Badge></TableCell>
                        <TableCell>ONT: {order.requiredOnt}, RTR: {order.requiredRouter}, STB: {order.requiredStb}</TableCell>
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