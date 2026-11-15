import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter } from '@/components/ui/dialog'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Plus, Search, Loader2, Edit, Trash2, Eye, Filter, Download, Upload } from 'lucide-react'
import { useOrders, useCreateOrder } from '@/hooks/useApi'
import { useWorkTypes } from '@/hooks/useApi'
import { useBuildings } from '@/hooks/useApi'
import { cn } from '@/utils/cn'
import { format } from 'date-fns'

const orderSchema = z.object({
  orderId: z.string().min(1, 'ID наряда обязателен'),
  dayId: z.string().min(1, 'День обязателен'),
  workTypeId: z.string().min(1, 'Тип работ обязателен'),
  buildingId: z.string().min(1, 'Здание обязательно'),
  registeredAt: z.string().min(1, 'Время регистрации обязательно'),
  slotStart: z.string().min(1, 'Начало слота обязательно'),
  slotEnd: z.string().min(1, 'Конец слота обязателен'),
  requiredEquipmentOnt: z.number().min(0).default(0),
  requiredEquipmentRouter: z.number().min(0).default(0),
  requiredEquipmentStb: z.number().min(0).default(0),
  isRepeat: z.boolean().default(false),
  accessNodeId: z.string().optional(),
  serviceCenterId: z.string().optional(),
  latestStart: z.string().optional(),
  deadline: z.string().optional(),
})

type OrderForm = z.infer<typeof orderSchema>

export const OrdersPage = () => {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingOrder, setEditingOrder] = useState<any>(null)
  const [viewOrder, setViewOrder] = useState<any>(null)

  const { data: orders, isLoading, refetch } = useOrders({
    date: dateFilter || undefined,
    status: statusFilter || undefined,
  })
  const { data: workTypes } = useWorkTypes()
  const { data: buildings } = useBuildings()
  const createOrder = useCreateOrder()

  const form = useForm<OrderForm>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      orderId: '',
      dayId: '',
      workTypeId: '',
      buildingId: '',
      registeredAt: format(new Date(), 'yyyy-MM-dd\'T\'HH:mm'),
      slotStart: format(new Date(), 'yyyy-MM-dd\'T\'09:00'),
      slotEnd: format(new Date(), 'yyyy-MM-dd\'T\'11:00'),
      requiredEquipmentOnt: 0,
      requiredEquipmentRouter: 1,
      requiredEquipmentStb: 0,
      isRepeat: false,
    },
  })

  const openCreateDialog = () => {
    setEditingOrder(null)
    form.reset({
      orderId: '',
      dayId: '',
      workTypeId: '',
      buildingId: '',
      registeredAt: format(new Date(), 'yyyy-MM-dd\'T\'HH:mm'),
      slotStart: format(new Date(), 'yyyy-MM-dd\'T\'09:00'),
      slotEnd: format(new Date(), 'yyyy-MM-dd\'T\'11:00'),
      requiredEquipmentOnt: 0,
      requiredEquipmentRouter: 1,
      requiredEquipmentStb: 0,
      isRepeat: false,
    })
    setDialogOpen(true)
  }

  const openEditDialog = (order: any) => {
    setEditingOrder(order)
    form.reset({
      orderId: order.code,
      dayId: order.dayId,
      workTypeId: order.workTypeId,
      buildingId: order.buildingId,
      registeredAt: format(new Date(order.registeredAt), 'yyyy-MM-dd\'T\'HH:mm'),
      slotStart: format(new Date(order.slotStart), 'yyyy-MM-dd\'T\'HH:mm'),
      slotEnd: format(new Date(order.slotEnd), 'yyyy-MM-dd\'T\'HH:mm'),
      requiredEquipmentOnt: order.requiredOnt,
      requiredEquipmentRouter: order.requiredRouter,
      requiredEquipmentStb: order.requiredStb,
      isRepeat: order.isRepeat,
      accessNodeId: order.accessNodeId,
      serviceCenterId: order.serviceCenterId,
      latestStart: order.latestStart ? format(new Date(order.latestStart), 'yyyy-MM-dd\'T\'HH:mm') : '',
      deadline: order.deadline ? format(new Date(order.deadline), 'yyyy-MM-dd\'T\'HH:mm') : '',
    })
    setDialogOpen(true)
  }

  const onSubmit = (data: OrderForm) => {
    const payload = {
      orderId: data.orderId,
      dayId: data.dayId,
      workTypeId: data.workTypeId,
      buildingId: data.buildingId,
      registeredAt: data.registeredAt,
      slot: {
        start: data.slotStart,
        end: data.slotEnd,
      },
      requiredEquipment: {
        ONT: data.requiredEquipmentOnt,
        ROUTER: data.requiredEquipmentRouter,
        STB: data.requiredEquipmentStb,
      },
      isRepeat: data.isRepeat,
      accessNodeId: data.accessNodeId,
      serviceCenterId: data.serviceCenterId,
      latestStart: data.latestStart,
      deadline: data.deadline,
    }

    createOrder.mutate(payload, {
      onSuccess: () => {
        setDialogOpen(false)
        refetch()
      },
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Наряды на работы</h1>
          <p className="text-muted-foreground">Управление нарядами на выездные работы</p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Создать наряд
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle>Список нарядов</CardTitle>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Поиск по коду..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-64 rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Все статусы" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Все статусы</SelectItem>
                  <SelectItem value="PENDING">PENDING</SelectItem>
                  <SelectItem value="ASSIGNED">ASSIGNED</SelectItem>
                  <SelectItem value="COMPLETED">COMPLETED</SelectItem>
                  <SelectItem value="CANCELLED">CANCELLED</SelectItem>
                  <SelectItem value="UNASSIGNED">UNASSIGNED</SelectItem>
                </SelectContent>
              </Select>
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Код наряда</TableHead>
                    <TableHead>День</TableHead>
                    <TableHead>Здание</TableHead>
                    <TableHead>Тип работ</TableHead>
                    <TableHead>Слот</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead>АО (О/Р/С)</TableHead>
                    <TableHead>Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders?.filter((o: any) => 
                    !search || o.code.toLowerCase().includes(search.toLowerCase())
                  ).map((order: any) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono text-xs">{order.id.slice(0, 8)}...</TableCell>
                      <TableCell className="font-mono font-medium">{order.code}</TableCell>
                      <TableCell>{order.dayId?.slice(0, 8)}...</TableCell>
                      <TableCell>{order.buildingId?.slice(0, 8)}...</TableCell>
                      <TableCell>{order.workTypeId?.slice(0, 8)}...</TableCell>
                      <TableCell className="text-sm">
                        {format(new Date(order.slotStart), 'HH:mm')} - {format(new Date(order.slotEnd), 'HH:mm')}
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          order.status === 'ASSIGNED' ? 'success' :
                          order.status === 'COMPLETED' ? 'secondary' :
                          order.status === 'CANCELLED' ? 'destructive' :
                          order.status === 'UNASSIGNED' ? 'warning' : 'default'
                        }>
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm font-mono">
                        {order.requiredOnt}/{order.requiredRouter}/{order.requiredStb}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon" onClick={() => setViewOrder(order)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => openEditDialog(order)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingOrder ? 'Редактировать наряд' : 'Создать наряд'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>ID наряда (код)</Label>
                <Input {...form.register('orderId')} disabled={!!editingOrder} />
              </div>
              <div className="space-y-2">
                <Label>ID дня</Label>
                <Input {...form.register('dayId')} placeholder="UUID дня" />
              </div>
              <div className="space-y-2">
                <Label>Тип работ</Label>
                <Select onValueChange={(value) => form.setValue('workTypeId', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите тип работ" />
                  </SelectTrigger>
                  <SelectContent>
                    {workTypes?.map((wt: any) => (
                      <SelectItem key={wt.id} value={wt.id}>{wt.code} — {wt.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Здание</Label>
                <Select onValueChange={(value) => form.setValue('buildingId', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите здание" />
                  </SelectTrigger>
                  <SelectContent>
                    {buildings?.map((b: any) => (
                      <SelectItem key={b.id} value={b.id}>{b.code} — {b.address.slice(0, 30)}...</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Зарегистрирован</Label>
                <Input type="datetime-local" {...form.register('registeredAt')} />
              </div>
              <div className="space-y-2">
                <Label>Слот начало</Label>
                <Input type="datetime-local" {...form.register('slotStart')} />
              </div>
              <div className="space-y-2">
                <Label>Слот конец</Label>
                <Input type="datetime-local" {...form.register('slotEnd')} />
              </div>
              <div className="space-y-2">
                <Label>ОНТ</Label>
                <Input type="number" {...form.register('requiredEquipmentOnt', { valueAsNumber: true })} />
              </div>
              <div className="space-y-2">
                <Label>Роутер</Label>
                <Input type="number" {...form.register('requiredEquipmentRouter', { valueAsNumber: true })} />
              </div>
              <div className="space-y-2">
                <Label>STB</Label>
                <Input type="number" {...form.register('requiredEquipmentStb', { valueAsNumber: true })} />
              </div>
              <div className="space-y-2 md:col-span-2 flex items-end">
                <Label>Повторный</Label>
                <Input type="checkbox" {...form.register('isRepeat')} />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Отмена</Button>
              <Button type="submit" disabled={createOrder.isPending}>
                {createOrder.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Сохранение...
                  </>
                ) : (
                  editingOrder ? 'Сохранить' : 'Создать'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!viewOrder} onOpenChange={(open) => !open && setViewOrder(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Детали наряда: {viewOrder?.code}</DialogTitle>
          </DialogHeader>
          <DialogContent className="p-4">
            <Tabs defaultValue="info">
              <TabsList>
                <TabsTrigger value="info">Информация</TabsTrigger>
                <TabsTrigger value="timeline">Хронология</TabsTrigger>
              </TabsList>
              <TabsContent value="info">
                <div className="space-y-3 text-sm">
                  <div className="grid grid-cols-2 gap-2">
                    <span className="text-muted-foreground">ID:</span>
                    <span className="font-mono">{viewOrder?.id}</span>
                    <span className="text-muted-foreground">Код:</span>
                    <span className="font-mono">{viewOrder?.code}</span>
                    <span className="text-muted-foreground">Статус:</span>
                    <Badge variant={
                      viewOrder?.status === 'ASSIGNED' ? 'success' :
                      viewOrder?.status === 'COMPLETED' ? 'secondary' :
                      viewOrder?.status === 'CANCELLED' ? 'destructive' : 'default'
                    }>{viewOrder?.status}</Badge>
                    <span className="text-muted-foreground">День:</span>
                    <span>{viewOrder?.dayId?.slice(0, 8)}...</span>
                    <span className="text-muted-foreground">Здание:</span>
                    <span>{viewOrder?.buildingId?.slice(0, 8)}...</span>
                    <span className="text-muted-foreground">Тип работ:</span>
                    <span>{viewOrder?.workTypeId?.slice(0, 8)}...</span>
                    <span className="text-muted-foreground">Слот:</span>
                    <span>{format(new Date(viewOrder?.slotStart), 'HH:mm')} - {format(new Date(viewOrder?.slotEnd), 'HH:mm')}</span>
                    <span className="text-muted-foreground">АО:</span>
                    <span>ONT: {viewOrder?.requiredOnt}, RTR: {viewOrder?.requiredRouter}, STB: {viewOrder?.requiredStb}</span>
                    <span className="text-muted-foreground">Повторный:</span>
                    <span>{viewOrder?.isRepeat ? 'Да' : 'Нет'}</span>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </DialogContent>
      </Dialog>
    </div>
  )
}