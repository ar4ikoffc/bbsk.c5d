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
import { Plus, Search, Loader2, Edit, Trash2, Settings, AlertTriangle, Check, X } from 'lucide-react'
import { useWorkTypes, useCreateWorkType } from '@/hooks/useApi'
import { cn } from '@/utils/cn'

const workTypeSchema = z.object({
  code: z.string().min(1, 'Код обязателен'),
  name: z.string().min(1, 'Название обязательно'),
  duration_min: z.number().min(1, 'Длительность должна быть > 0'),
  max_start_delay_min: z.number().min(0).optional().nullable(),
  deadline_kind: z.enum(['WORKING_DAYS', 'HOURS', 'SLOT']),
  deadline_value: z.number().min(1).optional().nullable(),
  repeat_deadline_value: z.number().min(1).optional().nullable(),
  pgp_relevant: z.boolean().default(false),
  profiles: z.array(z.string()).default([]),
})

type WorkTypeForm = z.infer<typeof workTypeSchema>

const PROFILES = ['INSTALL', 'LTP3']
const DEADLINE_KINDS = ['WORKING_DAYS', 'HOURS', 'SLOT']

interface WorkTypesPageProps {
  hideTitle?: boolean
}

export const WorkTypesPage = ({ hideTitle = false }: WorkTypesPageProps) => {
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingWt, setEditingWt] = useState<any>(null)

  const { data: workTypes, isLoading, refetch } = useWorkTypes()
  const createWorkType = useCreateWorkType()

  const form = useForm<WorkTypeForm>({
    resolver: zodResolver(workTypeSchema),
    defaultValues: {
      code: '',
      name: '',
      duration_min: 60,
      max_start_delay_min: 10,
      deadline_kind: 'WORKING_DAYS',
      deadline_value: 3,
      repeat_deadline_value: null,
      pgp_relevant: false,
      profiles: ['INSTALL'],
    },
  })

  const openCreate = () => {
    setEditingWt(null)
    form.reset({ code: '', name: '', duration_min: 60, max_start_delay_min: 10, deadline_kind: 'WORKING_DAYS', deadline_value: 3, repeat_deadline_value: null, pgp_relevant: false, profiles: ['INSTALL'] })
    setDialogOpen(true)
  }

  const openEdit = (wt: any) => {
    setEditingWt(wt)
    form.reset({
      code: wt.code,
      name: wt.name,
      duration_min: wt.durationMin || wt.duration_min,
      max_start_delay_min: wt.maxStartDelayMin || wt.max_start_delay_min,
      deadline_kind: wt.deadlineKind || wt.deadline_kind,
      deadline_value: wt.deadlineValue || wt.deadline_value,
      repeat_deadline_value: wt.repeatDeadlineValue || wt.repeat_deadline_value,
      pgp_relevant: wt.pgpRelevant || wt.pgp_relevant,
      profiles: wt.profiles || [],
    })
    setDialogOpen(true)
  }

  const onSubmit = (data: WorkTypeForm) => {
    createWorkType.mutate(data, { onSuccess: () => { setDialogOpen(false); refetch() } })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        {!hideTitle ? (
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Типы работ</h1>
            <p className="text-muted-foreground">Справочник нормативных работ со сроками выполнения и требуемыми квалификациями</p>
          </div>
        ) : <div />}
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Добавить тип работ
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle>Список типов работ ({workTypes?.length || 0})</CardTitle>
            <input type="text" placeholder="Поиск по коду/названию..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-64 rounded-md border border-input bg-background px-3 py-2 text-sm" />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Код</TableHead>
                  <TableHead>Название</TableHead>
                  <TableHead>Длительность (мин)</TableHead>
                  <TableHead>Макс задержка</TableHead>
                  <TableHead>Дедлайн</TableHead>
                  <TableHead>Значение</TableHead>
                  <TableHead>Повтор</TableHead>
                  <TableHead>PGP</TableHead>
                  <TableHead>Профили</TableHead>
                  <TableHead>Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {workTypes?.filter((wt: any) => !search || wt.code.toLowerCase().includes(search.toLowerCase()) || wt.name.toLowerCase().includes(search.toLowerCase())).map((wt: any) => (
                  <TableRow key={wt.id}>
                    <TableCell className="font-mono font-medium">{wt.code}</TableCell>
                    <TableCell className="max-w-[300px] truncate">{wt.name}</TableCell>
                    <TableCell>{wt.durationMin}</TableCell>
                    <TableCell>{wt.maxStartDelayMin ?? '-'}</TableCell>
                    <TableCell><Badge variant="secondary">{wt.deadlineKind}</Badge></TableCell>
                    <TableCell>{wt.deadlineValue ?? '-'}</TableCell>
                    <TableCell>{wt.repeatDeadlineValue ?? '-'}</TableCell>
                    <TableCell><Badge variant={wt.pgpRelevant ? 'destructive' : 'default'}>{wt.pgpRelevant ? 'Да' : 'Нет'}</Badge></TableCell>
                    <TableCell>{wt.profiles?.join(', ') || '-'}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(wt)}><Edit className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingWt ? 'Редактировать тип работ' : 'Создать тип работ'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2"><Label>Код</Label><Input {...form.register('code')} disabled={!!editingWt} placeholder="INST_PON_MKD" /></div>
              <div className="space-y-2"><Label>Название</Label><Input {...form.register('name')} placeholder="Инсталляция ШПД/IPTV, МКД, PON" /></div>
              <div className="space-y-2"><Label>Длительность (мин)</Label><Input type="number" {...form.register('duration_min', { valueAsNumber: true })} /></div>
              <div className="space-y-2"><Label>Макс. задержка старта (мин)</Label><Input type="number" {...form.register('max_start_delay_min', { valueAsNumber: true })} placeholder="Опционально" /></div>
              <div className="space-y-2"><Label>Тип дедлайна</Label><Select onValueChange={(value) => form.setValue('deadline_kind', value as "WORKING_DAYS" | "HOURS" | "SLOT")}>
                <SelectTrigger><SelectValue placeholder="Тип" /></SelectTrigger>
                <SelectContent>{DEADLINE_KINDS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
              </Select></div>
              <div className="space-y-2"><Label>Значение дедлайна</Label><Input type="number" {...form.register('deadline_value', { valueAsNumber: true })} placeholder="Опционально" /></div>
              <div className="space-y-2"><Label>Значение для повторных</Label><Input type="number" {...form.register('repeat_deadline_value', { valueAsNumber: true })} placeholder="Опционально" /></div>
              <div className="space-y-2 flex items-end"><Label>PGP релевантен</Label><Input type="checkbox" {...form.register('pgp_relevant')} /></div>
            </div>
            <div className="space-y-2">
              <Label>Профили</Label>
              <div className="flex flex-wrap gap-2">
                {PROFILES.map(p => (
                  <label key={p} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" {...form.register('profiles')} value={p} />
                    <span>{p}</span>
                  </label>
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Отмена</Button>
              <Button type="submit" disabled={createWorkType.isPending}>{editingWt ? 'Сохранить' : 'Создать'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}