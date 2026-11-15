import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Label } from '@/components/ui/label'
import { MapPin, Route, Loader2, ChevronLeft, ChevronRight } from 'lucide-react'
import { usePlan, useDay } from '@/hooks/useApi'
import { format } from 'date-fns'
import { cn } from '@/utils/cn'

export const MapViewPage = () => {
  const [selectedDate, setSelectedDate] = useState(() => format(new Date(), 'yyyy-MM-dd'))
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null)
  const [selectedStop, setSelectedStop] = useState<any>(null)

  const { data: plan } = usePlan(selectedDate)
  const { data: dayData } = useDay(selectedDate)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Карта маршрутов</h1>
          <p className="text-muted-foreground">Визуализация маршрутов бригад, остановок и зданий на карте Екатеринбурга</p>
        </div>
        <div className="flex items-center gap-4">
          <label className="text-sm text-muted-foreground">Дата:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm w-[180px]"
          />
        </div>
      </div>

      {plan && (
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
            <div className="flex items-center gap-4">
              <h2 className="text-lg font-semibold">Карта маршрутов — {selectedDate}</h2>
              <Badge variant="secondary">{plan.routes.length} маршрутов</Badge>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Маршруты ({plan.routes.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="routes" className="space-y-4">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="routes">Маршруты ({plan.routes.length})</TabsTrigger>
                  <TabsTrigger value="stops">Остановки выбранного</TabsTrigger>
                  <TabsTrigger value="summary">Сводка</TabsTrigger>
                </TabsList>

                <TabsContent value="routes">
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {plan.routes.map((route: any) => (
                      <Card key={route.routeId} className={cn(selectedRouteId === route.routeId && 'ring-2 ring-primary')}>
                        <CardContent className="py-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setSelectedRouteId(route.routeId)}
                              >
                                {selectedRouteId === route.routeId ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                              </Button>
                              <Badge variant="secondary">{route.serviceCenterCode}</Badge>
                              <span className="font-medium">{route.staffCode} — {route.staffName}</span>
                              <Badge variant={route.status === 'ACTIVE' ? 'success' : 'default'}>{route.status}</Badge>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Нарядов: {route.totalOrders} | Путь: {Math.round(route.totalTravelSec / 60)} мин
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="stops">
                  {selectedRouteId ? (
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
                        {(() => {
                          const route = plan.routes.find((r: any) => r.routeId === selectedRouteId)
                          if (!route) return []
                          return route.stops.map((stop: any) => (
                            <TableRow key={stop.seq} onClick={() => setSelectedStop({ ...stop, routeId: route.routeId })} className={cn(selectedStop?.seq === stop.seq && 'bg-accent')}>
                              <TableCell>{stop.seq}</TableCell>
                              <TableCell><Badge variant={stop.type === 'VISIT' ? 'success' : stop.type === 'BREAK' ? 'warning' : stop.type === 'RESTOCK' ? 'destructive' : 'secondary'}>{stop.type}</Badge></TableCell>
                              <TableCell>{stop.orderId ? `${stop.locationCode} (${stop.orderId})` : stop.locationCode}</TableCell>
                              <TableCell>{format(new Date(stop.arrival), 'HH:mm')}</TableCell>
                              <TableCell>{format(new Date(stop.startTime), 'HH:mm')}</TableCell>
                              <TableCell>{format(new Date(stop.endTime), 'HH:mm')}</TableCell>
                              <TableCell>{Math.round(stop.travelSec / 60)}</TableCell>
                              <TableCell>{stop.equipmentAfterOnt !== null ? `ONT: ${stop.equipmentAfterOnt}, RTR: ${stop.equipmentAfterRouter}, STB: ${stop.equipmentAfterStb}` : '-'}</TableCell>
                            </TableRow>
                          ))
                        })()}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">Выберите маршрут слева</div>
                  )}
                </TabsContent>

                <TabsContent value="summary">
                  <div className="grid gap-4 md:grid-cols-4">
                    <Card><CardHeader className="pb-2"><CardTitle>Всего нарядов</CardTitle></CardHeader><CardContent className="text-3xl font-bold">{plan.metrics.totalOrders}</CardContent></Card>
                    <Card><CardHeader className="pb-2"><CardTitle>Назначено</CardTitle></CardHeader><CardContent className="text-3xl font-bold text-green-500">{plan.metrics.assignedOrders}</CardContent></Card>
                    <Card><CardHeader className="pb-2"><CardTitle>Нераспределено</CardTitle></CardHeader><CardContent className="text-3xl font-bold text-destructive">{plan.metrics.unassignedOrders}</CardContent></Card>
                    <Card><CardHeader className="pb-2"><CardTitle>Маршрутов</CardTitle></CardHeader><CardContent className="text-3xl font-bold">{plan.metrics.activeRoutes}</CardContent></Card>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {plan.alerts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Алерты ({plan.alerts.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {plan.alerts.map((alert: any) => (
                    <Card key={alert.id} className="border-l-4 border-destructive">
                      <CardContent className="py-3">
                        <p className="font-medium">{alert.message}</p>
                        <p className="text-sm text-muted-foreground">{alert.type} | {format(new Date(alert.createdAt), 'HH:mm:ss')}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {plan.unassignedOrders.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Нераспределенные наряды ({plan.unassignedOrders.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {plan.unassignedOrders.map((uo: any) => (
                    <Card key={uo.id} className="border-l-4 border-yellow-500">
                      <CardContent className="py-3">
                        <p className="font-medium">Наряд: {uo.orderId}</p>
                        <p className="text-sm text-muted-foreground">Причина: {uo.reasonText}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {plan.pgpGroups.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>PGP группы ({plan.pgpGroups.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {plan.pgpGroups.map((pgp: any) => (
                    <Card key={pgp.id} className="border-l-4 border-orange-500">
                      <CardContent className="py-3">
                        <div className="grid gap-4 md:grid-cols-3">
                          <div><Label>Код группы</Label><p className="font-mono">{pgp.code}</p></div>
                          <div><Label>Узел доступа</Label><p className="font-mono">{pgp.accessNodeId}</p></div>
                          <div><Label>Действие</Label><Badge variant="warning">{pgp.action}</Badge></div>
                        </div>
                        {pgp.comment && <p className="text-sm text-muted-foreground mt-2">{pgp.comment}</p>}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {!plan && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">План не рассчитан для выбранной даты.</p>
            <p className="text-sm text-muted-foreground mt-2">Перейдите на вкладку «Планирование дня» и постройте план.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}