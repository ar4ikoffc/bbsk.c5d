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
import { Plus, Search, Loader2, Edit, Trash2, User, Clock } from 'lucide-react'
import { useStaff, useCreateStaff, useUpdateStaff, useDeleteStaff, useShifts, useCreateShift, useDeleteShift, useServiceCenters } from '@/hooks/useApi'
import { cn } from '@/utils/cn'

const staffSchema = z.object({
  staffId: z.string().min(1, 'Код обязателен'),
  displayName: z.string().min(1, 'Имя обязательно'),
  serviceCenterId: z.string().min(1, 'Сервисный центр обязателен'),
  shiftId: z.string().optional(),
  heightPermit: z.boolean().default(false),
  experienceYears: z.number().min(0).default(0),
  equipmentStart: z.object({
    ONT: z.number().min(0).default(0),
    ROUTER: z.number().min(0).default(0),
    STB: z.number().min(0).default(0),
  }),
  equipmentCapacity: z.object({
    ONT: z.number().min(0).default(0),
    ROUTER: z.number().min(0).default(0),
    STB: z.number().min(0).default(0),
  }),
  profiles: z.array(z.string()).default([]),
  technologies: z.array(z.string()).default([]),
})

const shiftSchema = z.object({
  startTime: z.string().min(1, 'Начало смены обязательно'),
  endTime: z.string().min(1, 'Конец смены обязателен'),
  breakDurationMin: z.number().min(0).default(60),
  breakWindowFrom: z.string().min(1, 'Окно перерыва от обязательно'),
  breakWindowTo: z.string().min(1, 'Окно перерыва до обязательно'),
})

type StaffForm = z.infer<typeof staffSchema>
type ShiftForm = z.infer<typeof shiftSchema>

const PROFILES = ['INSTALL', 'LTP3']
const TECHNOLOGIES = ['PON', 'FTTB', 'XDSL', 'DOCSIS']

export const StaffPage = () => {
  const [search, setSearch] = useState('')
  const [profileFilter, setProfileFilter] = useState('')
  const [techFilter, setTechFilter] = useState('')
  const [scFilter, setScFilter] = useState('')
  const [activeTab, setActiveTab] = useState<string>('staff')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingStaff, setEditingStaff] = useState<any>(null)

  const { data: staff, isLoading: staffLoading, refetch: refetchStaff } = useStaff()
  const { data: shifts, isLoading: shiftsLoading } = useShifts()
  const { data: serviceCenters } = useServiceCenters()
  const createStaff = useCreateStaff()
  const updateStaff = useUpdateStaff()
  const deleteStaff = useDeleteStaff()
  const createShift = useCreateShift()
  const deleteShift = useDeleteShift()

  const staffForm = useForm<StaffForm>({
    resolver: zodResolver(staffSchema),
    defaultValues: {
      staffId: '',
      displayName: '',
      serviceCenterId: '',
      shiftId: '',
      heightPermit: false,
      experienceYears: 0,
      equipmentStart: { ONT: 0, ROUTER: 0, STB: 0 },
      equipmentCapacity: { ONT: 0, ROUTER: 0, STB: 0 },
      profiles: [],
      technologies: [],
    },
  })

  const shiftForm = useForm<ShiftForm>({
    resolver: zodResolver(shiftSchema),
    defaultValues: {
      startTime: '08:00',
      endTime: '17:00',
      breakDurationMin: 60,
      breakWindowFrom: '12:00',
      breakWindowTo: '14:00',
    },
  })

  const openCreateStaff = () => {
    setEditingStaff(null)
    staffForm.reset({
      staffId: '',
      displayName: '',
      serviceCenterId: '',
      shiftId: '',
      heightPermit: false,
      experienceYears: 0,
      equipmentStart: { ONT: 0, ROUTER: 0, STB: 0 },
      equipmentCapacity: { ONT: 0, ROUTER: 0, STB: 0 },
      profiles: [],
      technologies: [],
    })
    setDialogOpen(true)
  }

  const openEditStaff = (s: any) => {
    setEditingStaff(s)
    staffForm.reset({
      staffId: s.staffId || s.code,
      displayName: s.displayName || s.display_name,
      serviceCenterId: s.serviceCenterId || s.service_center_id,
      shiftId: s.shiftId || s.shift_id,
      heightPermit: s.heightPermit || s.height_permit,
      experienceYears: s.experienceYears || s.experience_years,
      equipmentStart: s.equipmentStart || s.equipment_start || { ONT: 0, ROUTER: 0, STB: 0 },
      equipmentCapacity: s.equipmentCapacity || s.equipment_capacity || { ONT: 0, ROUTER: 0, STB: 0 },
      profiles: s.profiles || [],
      technologies: s.technologies || [],
    })
    setDialogOpen(true)
  }

  const onStaffSubmit = (data: StaffForm) => {
    if (editingStaff) {
      updateStaff.mutate({ id: editingStaff.id, data }, { onSuccess: () => { setDialogOpen(false); refetchStaff() } })
    } else {
      createStaff.mutate(data, { onSuccess: () => { setDialogOpen(false); refetchStaff() } })
    }
  }

  const onShiftSubmit = (data: ShiftForm) => {
    createShift.mutate(data, { onSuccess: () => { setDialogOpen(false); } })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Сотрудники и смены</h1>
          <p className="text-muted-foreground">Управление персоналом выездных инженеров и рабочими сменами</p>
        </div>
        {activeTab === 'staff' && (
          <Button onClick={openCreateStaff}>
            <Plus className="mr-2 h-4 w-4" />
            Добавить сотрудника
          </Button>
        )}
        {activeTab === 'shifts' && (
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Добавить смену
          </Button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="staff"><User className="mr-2 h-4 w-4" />Сотрудники</TabsTrigger>
          <TabsTrigger value="shifts"><Clock className="mr-2 h-4 w-4" />Смены</TabsTrigger>
        </TabsList>

        <TabsContent value="staff">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <CardTitle>Список сотрудников ({staff?.length || 0})</CardTitle>
                <div className="flex items-center gap-2 flex-wrap">
                  <input type="text" placeholder="Поиск по коду/имени..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-64 rounded-md border border-input bg-background px-3 py-2 text-sm" />
                  <Select value={profileFilter} onValueChange={setProfileFilter}>
                    <SelectTrigger className="w-[140px]"><SelectValue placeholder="Профиль" /></SelectTrigger>
                    <SelectContent><SelectItem value="">Все</SelectItem>{PROFILES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                  </Select>
                  <Select value={techFilter} onValueChange={setTechFilter}>
                    <SelectTrigger className="w-[140px]"><SelectValue placeholder="Технология" /></SelectTrigger>
                    <SelectContent><SelectItem value="">Все</SelectItem>{TECHNOLOGIES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                  </Select>
                  <Select value={scFilter} onValueChange={setScFilter}>
                    <SelectTrigger className="w-[180px]"><SelectValue placeholder="Сервисный центр" /></SelectTrigger>
                    <SelectContent><SelectItem value="">Все</SelectItem>{serviceCenters?.map((sc: any) => <SelectItem key={sc.id} value={sc.id}>{sc.code}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {staffLoading ? (
                <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Код</TableHead>
                        <TableHead>Имя</TableHead>
                        <TableHead>СЦ</TableHead>
                        <TableHead>Смена</TableHead>
                        <TableHead>Профили</TableHead>
                        <TableHead>Технологии</TableHead>
                        <TableHead>Вых. разрешение</TableHead>
                        <TableHead>Опыт (лет)</TableHead>
                        <TableHead>АО старт (О/Р/С)</TableHead>
                        <TableHead>АО вмест. (О/Р/С)</TableHead>
                        <TableHead>Действия</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {staff?.filter((s: any) =>
                        (!search || s.code.toLowerCase().includes(search.toLowerCase()) || s.displayName.toLowerCase().includes(search.toLowerCase())) &&
                        (!profileFilter || s.profiles?.includes(profileFilter)) &&
                        (!techFilter || s.technologies?.includes(techFilter)) &&
                        (!scFilter || s.serviceCenterId === scFilter)
                      ).map((s: any) => (
                        <TableRow key={s.id}>
                          <TableCell className="font-mono font-medium">{s.code}</TableCell>
                          <TableCell>{s.displayName}</TableCell>
                          <TableCell>{serviceCenters?.find((sc: any) => sc.id === s.serviceCenterId)?.code || s.serviceCenterId?.slice(0, 8)}</TableCell>
                          <TableCell>{shifts?.find((sh: any) => sh.id === s.shiftId)?.id?.slice(0, 8)}</TableCell>
                          <TableCell>{s.profiles?.join(', ') || '-'}</TableCell>
                          <TableCell>{s.technologies?.join(', ') || '-'}</TableCell>
                          <TableCell><Badge variant={s.heightPermit ? 'success' : 'default'}>{s.heightPermit ? 'Да' : 'Нет'}</Badge></TableCell>
                          <TableCell>{s.experienceYears}</TableCell>
                          <TableCell className="font-mono text-sm">{s.equipmentStartOnt}/{s.equipmentStartRouter}/{s.equipmentStartStb}</TableCell>
                          <TableCell className="font-mono text-sm">{s.equipmentCapacityOnt}/{s.equipmentCapacityRouter}/{s.equipmentCapacityStb}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="icon" onClick={() => openEditStaff(s)}><Edit className="h-4 w-4" /></Button>
                              <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteStaff.mutate(s.id, { onSuccess: () => refetchStaff() })}><Trash2 className="h-4 w-4" /></Button>
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
        </TabsContent>

        <TabsContent value="shifts">
          <Card>
            <CardHeader><CardTitle>Графики смен ({shifts?.length || 0})</CardTitle></CardHeader>
            <CardContent>
              {shiftsLoading ? (
                <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Начало</TableHead>
                      <TableHead>Конец</TableHead>
                      <TableHead>Перерыв (мин)</TableHead>
                      <TableHead>Окно от</TableHead>
                      <TableHead>Окно до</TableHead>
                      <TableHead>Действия</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {shifts?.map((sh: any) => (
                      <TableRow key={sh.id}>
                        <TableCell className="font-mono text-xs">{sh.id.slice(0, 8)}...</TableCell>
                        <TableCell>{sh.startTime}</TableCell>
                        <TableCell>{sh.endTime}</TableCell>
                        <TableCell>{sh.breakDurationMin}</TableCell>
                        <TableCell>{sh.breakWindowFrom}</TableCell>
                        <TableCell>{sh.breakWindowTo}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteShift.mutate(sh.id)}><Trash2 className="h-4 w-4" /></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{activeTab === 'staff' ? (editingStaff ? 'Редактировать сотрудника' : 'Создать сотрудника') : 'Создать смену'}</DialogTitle>
          </DialogHeader>
          {activeTab === 'staff' ? (
            <form onSubmit={staffForm.handleSubmit(onStaffSubmit)} className="space-y-4 p-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2"><Label>Код</Label><Input {...staffForm.register('staffId')} disabled={!!editingStaff} /></div>
                <div className="space-y-2"><Label>Имя</Label><Input {...staffForm.register('displayName')} /></div>
                <div className="space-y-2"><Label>Сервисный центр</Label><Select onValueChange={(value) => staffForm.setValue('serviceCenterId', value)}>
                  <SelectTrigger><SelectValue placeholder="Выберите СЦ" /></SelectTrigger>
                  <SelectContent>{serviceCenters?.map((sc: any) => <SelectItem key={sc.id} value={sc.id}>{sc.code} — {sc.name}</SelectItem>)}</SelectContent>
                </Select></div>
                <div className="space-y-2"><Label>Смена</Label><Select onValueChange={(value) => staffForm.setValue('shiftId', value)}>
                  <SelectTrigger><SelectValue placeholder="Выберите смену" /></SelectTrigger>
                  <SelectContent>{shifts?.map((sh: any) => <SelectItem key={sh.id} value={sh.id}>{sh.startTime} - {sh.endTime}</SelectItem>)}</SelectContent>
                </Select></div>
                <div className="space-y-2"><Label>Опыт (лет)</Label><Input type="number" step="0.5" {...staffForm.register('experienceYears', { valueAsNumber: true })} /></div>
                <div className="space-y-2 flex items-end"><Label>Разрешение на высоту</Label><Input type="checkbox" {...staffForm.register('heightPermit')} /></div>
              </div>
              <div className="space-y-2">
                <Label>Профили</Label>
                <div className="flex flex-wrap gap-2">
                  {PROFILES.map(p => (
                    <label key={p} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" {...staffForm.register('profiles')} value={p} />
                      <span>{p}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Технологии</Label>
                <div className="flex flex-wrap gap-2">
                  {TECHNOLOGIES.map(t => (
                    <label key={t} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" {...staffForm.register('technologies')} value={t} />
                      <span>{t}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-4 border-t pt-4">
                <div className="space-y-2"><Label>АО старт: ОНТ</Label><Input type="number" {...staffForm.register('equipmentStart.ONT', { valueAsNumber: true })} /></div>
                <div className="space-y-2"><Label>АО старт: Роутер</Label><Input type="number" {...staffForm.register('equipmentStart.ROUTER', { valueAsNumber: true })} /></div>
                <div className="space-y-2"><Label>АО старт: STB</Label><Input type="number" {...staffForm.register('equipmentStart.STB', { valueAsNumber: true })} /></div>
                <div className="space-y-2"><Label>АО вмест.: ОНТ</Label><Input type="number" {...staffForm.register('equipmentCapacity.ONT', { valueAsNumber: true })} /></div>
                <div className="space-y-2"><Label>АО вмест.: Роутер</Label><Input type="number" {...staffForm.register('equipmentCapacity.ROUTER', { valueAsNumber: true })} /></div>
                <div className="space-y-2"><Label>АО вмест.: STB</Label><Input type="number" {...staffForm.register('equipmentCapacity.STB', { valueAsNumber: true })} /></div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Отмена</Button>
                <Button type="submit" disabled={createStaff.isPending || updateStaff.isPending}>{editingStaff ? 'Сохранить' : 'Создать'}</Button>
              </DialogFooter>
            </form>
          ) : (
            <form onSubmit={shiftForm.handleSubmit(onShiftSubmit)} className="space-y-4 p-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2"><Label>Начало смены</Label><Input type="time" {...shiftForm.register('startTime')} /></div>
                <div className="space-y-2"><Label>Конец смены</Label><Input type="time" {...shiftForm.register('endTime')} /></div>
                <div className="space-y-2"><Label>Перерыв (мин)</Label><Input type="number" {...shiftForm.register('breakDurationMin', { valueAsNumber: true })} /></div>
                <div className="space-y-2"><Label>Окно перерыва от</Label><Input type="time" {...shiftForm.register('breakWindowFrom')} /></div>
                <div className="space-y-2"><Label>Окно перерыва до</Label><Input type="time" {...shiftForm.register('breakWindowTo')} /></div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Отмена</Button>
                <Button type="submit" disabled={createShift.isPending}>Создать</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}