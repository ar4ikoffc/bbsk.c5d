import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Search, Loader2, AlertTriangle, Users, MapPin, Package } from 'lucide-react'
import { usePlan, useDay } from '@/hooks/useApi'
import { format } from 'date-fns'
import { cn } from '@/utils/cn'

export const PgpGroupsPage = () => {
  const [selectedDate, setSelectedDate] = useState(() => format(new Date(), 'yyyy-MM-dd'))

  const { data: plan } = usePlan(selectedDate)
  const { data: dayData } = useDay(selectedDate)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">PGP группы</h1>
          <p className="text-muted-foreground">Группы массовых неисправностей (ПГП) — автоматически выделяемые при ≥3 авариях на узле за ≤60 мин</p>
        </div>
        <div className="flex items-center gap-4">
          <label className="text-sm text-muted-foreground">Дата:</label>
          <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="rounded-md border border-input bg-background px-3 py-2 text-sm w-[180px]" />
        </div>
      </div>

      {plan && plan.pgpGroups.length > 0 ? (
        <div className="space-y-4">
          {plan.pgpGroups.map((pgp: any) => (
            <Card key={pgp.id} className="border-l-4 border-orange-500">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant="warning">{pgp.code}</Badge>
                    <Badge variant="secondary">{pgp.action}</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">Обнаружено: {format(new Date(pgp.detectedAt), 'HH:mm:ss')}</div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div><Label>Узел доступа</Label><p className="font-mono">{pgp.accessNodeId}</p></div>
                  <div><Label>Действие</Label><p>{pgp.action}</p></div>
                  <div><Label>Комментарий</Label><p className="text-muted-foreground">{pgp.comment || '—'}</p></div>
                </div>
                {pgp.orders && pgp.orders.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">Наряды в группе ({pgp.orders.length})</h4>
                    <Table>
                      <TableHeader><TableRow><TableHead>ID наряда</TableHead><TableHead>Код</TableHead><TableHead>Здание</TableHead></TableRow></TableHeader>
                      <TableBody>
                        {pgp.orders.map((o: any) => (
                          <TableRow key={o.id}><TableCell>{o.id.slice(0, 8)}...</TableCell><TableCell className="font-mono">{o.code}</TableCell><TableCell>{o.buildingId?.slice(0, 8)}...</TableCell></TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">PGP групп не обнаружено</h3>
            <p className="text-muted-foreground">Для выбранной даты нет групп массовых неисправностей или план не рассчитан.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}