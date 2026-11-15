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
import { Plus, Search, Loader2, Edit, Trash2, Building2, Wifi, MapPin } from 'lucide-react'
import { useBuildings, useServiceCenters, useAccessNodes, useCreateAccessNode, useCreateBuilding, useCreateServiceCenter } from '@/hooks/useApi'
import { cn } from '@/utils/cn'

const buildingSchema = z.object({
  buildingId: z.string().min(1, 'Код обязателен'),
  accessNodeId: z.string().min(1, 'Узел доступа обязателен'),
  zoneServiceCenterId: z.string().optional(),
  address: z.string().min(1, 'Адрес обязателен'),
  lat: z.number(),
  lon: z.number(),
  buildingType: z.enum(['MKD', 'PRIVATE']),
  overheadLine: z.boolean().default(false)
})

const accessNodeSchema = z.object({
  accessNodeId: z.string().min(1, 'Код обязателен'),
  nodeType: z.enum(['OLT', 'SWITCH', 'DSLAM', 'CMTS']),
  technology: z.enum(['PON', 'FTTB', 'XDSL', 'DOCSIS']),
  name: z.string().min(1, 'Название обязательно'),
  address: z.string().min(1, 'Адрес обязателен'),
  lat: z.number(),
  lon: z.number(),
})

const scSchema = z.object({
  serviceCenterId: z.string().min(1, 'Код обязателен'),
  name: z.string().min(1, 'Название обязательно'),
  address: z.string().min(1, 'Адрес обязателен'),
  lat: z.number(),
  lon: z.number(),
  openingHours: z.object({
    open: z.string().min(1, 'Время открытия обязательно'),
    close: z.string().min(1, 'Время закрытия обязательно')
  }),
  restockDurationMin: z.number().min(0).default(15)
});

type BuildingForm = z.infer<typeof buildingSchema>
type AccessNodeForm = z.infer<typeof accessNodeSchema>
type SCForm = z.infer<typeof scSchema>

export const BuildingsPage = () => {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [anFilter, setAnFilter] = useState('')
  const [scFilter, setScFilter] = useState('')
  const [activeTab, setActiveTab] = useState<string>('buildings')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [dialogError, setDialogError] = useState<string>('')

  const { data: buildings, isLoading: buildingsLoading, refetch: refetchBuildings } = useBuildings()
  const { data: accessNodes, isLoading: anLoading, refetch: refetchAN } = useAccessNodes()
  const { data: serviceCenters, isLoading: scLoading, refetch: refetchSC } = useServiceCenters()
  const createAccessNode = useCreateAccessNode()
  const createBuilding = useCreateBuilding()
  const createServiceCenter = useCreateServiceCenter()

  const buildingForm = useForm<BuildingForm>({
    resolver: zodResolver(buildingSchema),
    defaultValues: { buildingId: '', accessNodeId: '', zoneServiceCenterId: '', address: '', lat: 56.8387, lon: 60.6087, buildingType: 'MKD', overheadLine: false }
  })

  const anForm = useForm<AccessNodeForm>({
    resolver: zodResolver(accessNodeSchema),
    defaultValues: { accessNodeId: '', nodeType: 'OLT', technology: 'PON', name: '', address: '', lat: 56.8387, lon: 60.6087 }
  })

  const scForm = useForm<SCForm>({
    resolver: zodResolver(scSchema),
    defaultValues: { serviceCenterId: '', name: '', address: '', lat: 56.8387, lon: 60.6087, openingHours: { open: '08:00', close: '17:00' }, restockDurationMin: 15 }
  })

  const openCreate = (type: typeof activeTab) => {
    setEditingItem(null)
    setDialogError('')
    if (type === 'buildings') buildingForm.reset({ buildingId: '', accessNodeId: '', zoneServiceCenterId: '', address: '', lat: 56.8387, lon: 60.6087, buildingType: 'MKD', overheadLine: false })
    if (type === 'access-nodes') anForm.reset({ accessNodeId: '', nodeType: 'OLT', technology: 'PON', name: '', address: '', lat: 56.8387, lon: 60.6087 })
    if (type === 'service-centers') scForm.reset({ serviceCenterId: '', name: '', address: '', lat: 56.8387, lon: 60.6087, openingHours: { open: '08:00', close: '17:00' }, restockDurationMin: 15 })
    setDialogOpen(true)
  }

  const anMutateOptions = { onSuccess: () => { setDialogOpen(false); refetchAN() }, onError: (error: any) => { setDialogError(error.response?.data?.message || 'Ошибка создания узла'); } }
  const buildingMutateOptions = { onSuccess: () => { setDialogOpen(false); refetchBuildings() }, onError: (error: any) => { setDialogError(error.response?.data?.message || 'Ошибка создания здания'); } }
  const scMutateOptions = { onSuccess: () => { setDialogOpen(false); refetchSC() }, onError: (error: any) => { setDialogError(error.response?.data?.message || 'Ошибка создания СЦ'); } }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Инфраструктура и здания</h1>
          <p className="text-muted-foreground">Управление зданиями, узлами доступа и сервисными центрами</p>
        </div>
        <Button onClick={() => openCreate(activeTab)}>
          <Plus className="mr-2 h-4 w-4" />
          {activeTab === 'buildings' && 'Добавить здание'}
          {activeTab === 'access-nodes' && 'Добавить узел'}
          {activeTab === 'service-centers' && 'Добавить СЦ'}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="buildings"><Building2 className="mr-2 h-4 w-4" />Здания ({buildings?.length || 0})</TabsTrigger>
          <TabsTrigger value="access-nodes"><Wifi className="mr-2 h-4 w-4" />Узлы доступа ({accessNodes?.length || 0})</TabsTrigger>
          <TabsTrigger value="service-centers"><MapPin className="mr-2 h-4 w-4" />Сервисные центры ({serviceCenters?.length || 0})</TabsTrigger>
        </TabsList>

        <TabsContent value="buildings">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <CardTitle>Список зданий</CardTitle>
                <div className="flex items-center gap-2 flex-wrap">
                  <input type="text" placeholder="Поиск по коду/адресу..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-64 rounded-md border border-input bg-background px-3 py-2 text-sm" />
                  <Select value={typeFilter} onValueChange={setTypeFilter}><SelectTrigger className="w-[140px]"><SelectValue placeholder="Тип" /></SelectTrigger><SelectContent><SelectItem value="">Все</SelectItem><SelectItem value="MKD">МКД</SelectItem><SelectItem value="PRIVATE">Частный сектор</SelectItem></SelectContent></Select>
                  <Select value={anFilter} onValueChange={setAnFilter}><SelectTrigger className="w-[160px]"><SelectValue placeholder="Узел доступа" /></SelectTrigger><SelectContent><SelectItem value="">Все</SelectItem>{accessNodes?.map((an: any) => <SelectItem key={an.id} value={an.id}>{an.code}</SelectItem>)}</SelectContent></Select>
                  <Select value={scFilter} onValueChange={setScFilter}><SelectTrigger className="w-[160px]"><SelectValue placeholder="СЦ зоны" /></SelectTrigger><SelectContent><SelectItem value="">Все</SelectItem>{serviceCenters?.map((sc: any) => <SelectItem key={sc.id} value={sc.id}>{sc.code}</SelectItem>)}</SelectContent></Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {buildingsLoading ? <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div> : (
                <Table>
                  <TableHeader><TableRow><TableHead>Код</TableHead><TableHead>Адрес</TableHead><TableHead>Тип</TableHead><TableHead>Узел доступа</TableHead><TableHead>СЦ зоны</TableHead><TableHead>ВЛС</TableHead><TableHead>Координаты</TableHead><TableHead>Действия</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {buildings?.filter((b: any) => !search || b.code.toLowerCase().includes(search.toLowerCase()) || b.address.toLowerCase().includes(search.toLowerCase())).map((b: any) => (
                      <TableRow key={b.id}>
                        <TableCell className="font-mono font-medium">{b.code}</TableCell>
                        <TableCell className="max-w-[200px] truncate">{b.address}</TableCell>
                        <TableCell><Badge variant={b.buildingType === 'MKD' ? 'secondary' : 'default'}>{b.buildingType}</Badge></TableCell>
                        <TableCell>{accessNodes?.find((an: any) => an.id === b.accessNodeId)?.code || b.accessNodeId?.slice(0, 8)}</TableCell>
                        <TableCell>{serviceCenters?.find((sc: any) => sc.id === b.zoneServiceCenterId)?.code || b.zoneServiceCenterId?.slice(0, 8) || '-'}</TableCell>
                        <TableCell><Badge variant={b.overheadLine ? 'success' : 'default'}>{b.overheadLine ? 'Да' : 'Нет'}</Badge></TableCell>
                        <TableCell className="font-mono text-xs">{b.lat.toFixed(4)}, {b.lon.toFixed(4)}</TableCell>
                        <TableCell><Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="h-4 w-4" /></Button></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="access-nodes">
          <Card>
            <CardHeader><CardTitle>Узлы доступа ({accessNodes?.length || 0})</CardTitle></CardHeader>
            <CardContent>
              {anLoading ? <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div> : (
                <Table>
                  <TableHeader><TableRow><TableHead>Код</TableHead><TableHead>Тип</TableHead><TableHead>Технология</TableHead><TableHead>Название</TableHead><TableHead>Адрес</TableHead><TableHead>Координаты</TableHead><TableHead>Действия</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {accessNodes?.map((an: any) => (
                      <TableRow key={an.id}>
                        <TableCell className="font-mono font-medium">{an.code}</TableCell>
                        <TableCell>{an.nodeType}</TableCell>
                        <TableCell><Badge variant="secondary">{an.technology}</Badge></TableCell>
                        <TableCell>{an.name}</TableCell>
                        <TableCell className="max-w-[200px] truncate">{an.address}</TableCell>
                        <TableCell className="font-mono text-xs">{an.lat.toFixed(4)}, {an.lon.toFixed(4)}</TableCell>
                        <TableCell><Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="h-4 w-4" /></Button></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="service-centers">
          <Card>
            <CardHeader><CardTitle>Сервисные центры ({serviceCenters?.length || 0})</CardTitle></CardHeader>
            <CardContent>
              {scLoading ? <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div> : (
                <Table>
                  <TableHeader><TableRow><TableHead>Код</TableHead><TableHead>Название</TableHead><TableHead>Адрес</TableHead><TableHead>Режим</TableHead><TableHead>Пополнение (мин)</TableHead><TableHead>Координаты</TableHead><TableHead>Действия</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {serviceCenters?.map((sc: any) => (
                      <TableRow key={sc.id}>
                        <TableCell className="font-mono font-medium">{sc.code}</TableCell>
                        <TableCell>{sc.name}</TableCell>
                        <TableCell className="max-w-[200px] truncate">{sc.address}</TableCell>
                        <TableCell>{sc.openingHours?.open} - {sc.openingHours?.close}</TableCell>
                        <TableCell>{sc.restockDurationMin}</TableCell>
                        <TableCell className="font-mono text-xs">{sc.lat.toFixed(4)}, {sc.lon.toFixed(4)}</TableCell>
                        <TableCell><Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="h-4 w-4" /></Button></TableCell>
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
          <DialogHeader><DialogTitle>{activeTab === 'buildings' ? 'Здание' : activeTab === 'access-nodes' ? 'Узел доступа' : 'Сервисный центр'}</DialogTitle></DialogHeader>
          {activeTab === 'access-nodes' ? (
            <form onSubmit={anForm.handleSubmit((data) => createAccessNode.mutate(data, anMutateOptions))} className="space-y-4 p-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2"><Label>Код</Label><Input {...anForm.register('accessNodeId')} /></div>
                <div className="space-y-2"><Label>Тип</Label><Select onValueChange={(value) => anForm.setValue('nodeType', value as "OLT" | "SWITCH" | "DSLAM" | "CMTS")}>
                  <SelectTrigger><SelectValue placeholder="Тип" /></SelectTrigger>
                  <SelectContent><SelectItem value="OLT">OLT</SelectItem><SelectItem value="SWITCH">SWITCH</SelectItem><SelectItem value="DSLAM">DSLAM</SelectItem><SelectItem value="CMTS">CMTS</SelectItem></SelectContent>
                </Select></div>
                <div className="space-y-2"><Label>Технология</Label><Select onValueChange={(value) => anForm.setValue('technology', value as "PON" | "FTTB" | "XDSL" | "DOCSIS")}>
                  <SelectTrigger><SelectValue placeholder="Технология" /></SelectTrigger>
                  <SelectContent><SelectItem value="PON">PON</SelectItem><SelectItem value="FTTB">FTTB</SelectItem><SelectItem value="XDSL">XDSL</SelectItem><SelectItem value="DOCSIS">DOCSIS</SelectItem></SelectContent>
                </Select></div>
                <div className="space-y-2"><Label>Название</Label><Input {...anForm.register('name')} /></div>
                <div className="space-y-2 md:col-span-2"><Label>Адрес</Label><Input {...anForm.register('address')} /></div>
                <div className="space-y-2"><Label>Широта</Label><Input type="number" step="any" {...anForm.register('lat', { valueAsNumber: true })} /></div>
                <div className="space-y-2"><Label>Долгота</Label><Input type="number" step="any" {...anForm.register('lon', { valueAsNumber: true })} /></div>
              </div>
              {dialogError && <div className="text-sm text-destructive">{dialogError}</div>}
              <DialogFooter><Button type="button" variant="outline" onClick={() => { setDialogOpen(false); setDialogError('') }}>Отмена</Button><Button type="submit" disabled={createAccessNode.isPending}>Создать</Button></DialogFooter>
            </form>
          ) : null}
          {activeTab === 'buildings' ? (
            <form onSubmit={buildingForm.handleSubmit((data) => createBuilding.mutate(data, buildingMutateOptions))} className="space-y-4 p-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2"><Label>Код</Label><Input {...buildingForm.register('buildingId')} /></div>
                <div className="space-y-2"><Label>Узел доступа</Label><Select onValueChange={(value) => buildingForm.setValue('accessNodeId', value)}>
                  <SelectTrigger><SelectValue placeholder="Узел" /></SelectTrigger>
                  <SelectContent>{accessNodes?.map((an: any) => <SelectItem key={an.id} value={an.id}>{an.code}</SelectItem>)}</SelectContent>
                </Select></div>
                <div className="space-y-2"><Label>СЦ зоны</Label><Select onValueChange={(value) => buildingForm.setValue('zoneServiceCenterId', value)}>
                  <SelectTrigger><SelectValue placeholder="СЦ (опционально)" /></SelectTrigger>
                  <SelectContent><SelectItem value="">Не задан</SelectItem>{serviceCenters?.map((sc: any) => <SelectItem key={sc.id} value={sc.id}>{sc.code}</SelectItem>)}</SelectContent>
                </Select></div>
                <div className="space-y-2"><Label>Тип здания</Label><Select onValueChange={(value) => buildingForm.setValue('buildingType', value as "MKD" | "PRIVATE")}>
                  <SelectTrigger><SelectValue placeholder="Тип" /></SelectTrigger>
                  <SelectContent><SelectItem value="MKD">МКД</SelectItem><SelectItem value="PRIVATE">Частный сектор</SelectItem></SelectContent>
                </Select></div>
                <div className="space-y-2 md:col-span-2"><Label>Адрес</Label><Input {...buildingForm.register('address')} /></div>
                <div className="space-y-2"><Label>Широта</Label><Input type="number" step="any" {...buildingForm.register('lat', { valueAsNumber: true })} /></div>
                <div className="space-y-2"><Label>Долгота</Label><Input type="number" step="any" {...buildingForm.register('lon', { valueAsNumber: true })} /></div>
                <div className="space-y-2 flex items-end"><Label>ВЛС</Label><Input type="checkbox" {...buildingForm.register('overheadLine')} /></div>
              </div>
              {dialogError && <div className="text-sm text-destructive">{dialogError}</div>}
              <DialogFooter><Button type="button" variant="outline" onClick={() => { setDialogOpen(false); setDialogError('') }}>Отмена</Button><Button type="submit">Создать</Button></DialogFooter>
            </form>
          ) : null}
          {activeTab === 'service-centers' ? (
            <form onSubmit={scForm.handleSubmit((data) => createServiceCenter.mutate(data, scMutateOptions))} className="space-y-4 p-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2"><Label>Код</Label><Input {...scForm.register('serviceCenterId')} /></div>
                <div className="space-y-2"><Label>Название</Label><Input {...scForm.register('name')} /></div>
                <div className="space-y-2 md:col-span-2"><Label>Адрес</Label><Input {...scForm.register('address')} /></div>
                <div className="space-y-2"><Label>Широта</Label><Input type="number" step="any" {...scForm.register('lat', { valueAsNumber: true })} /></div>
                <div className="space-y-2"><Label>Долгота</Label><Input type="number" step="any" {...scForm.register('lon', { valueAsNumber: true })} /></div>
                <div className="space-y-2"><Label>Время открытия</Label><Input type="time" {...scForm.register('openingHours.open')} /></div>
                <div className="space-y-2"><Label>Время закрытия</Label><Input type="time" {...scForm.register('openingHours.close')} /></div>
                <div className="space-y-2"><Label>Пополнение (мин)</Label><Input type="number" {...scForm.register('restockDurationMin', { valueAsNumber: true })} /></div>
              </div>
              {dialogError && <div className="text-sm text-destructive">{dialogError}</div>}
              <DialogFooter><Button type="button" variant="outline" onClick={() => { setDialogOpen(false); setDialogError('') }}>Отмена</Button><Button type="submit">Создать</Button></DialogFooter>
            </form>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  )
}