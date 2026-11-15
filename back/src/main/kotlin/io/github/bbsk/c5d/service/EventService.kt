package io.github.bbsk.c5d.service

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule
import io.github.bbsk.c5d.exception.BadRequestException
import io.github.bbsk.c5d.exception.NotFoundException
import io.github.bbsk.c5d.model.day.dto.request.DayOrderInputDto
import io.github.bbsk.c5d.model.day.entity.WorkDay
import io.github.bbsk.c5d.model.day.entity.WorkOrder
import io.github.bbsk.c5d.model.day.enums.OrderStatus
import io.github.bbsk.c5d.model.event.dto.request.EventInputDto
import io.github.bbsk.c5d.model.event.dto.response.EventResultResponse
import io.github.bbsk.c5d.model.event.entity.Event
import io.github.bbsk.c5d.model.event.enums.EventType
import io.github.bbsk.c5d.model.plan.enums.RouteStatus
import io.github.bbsk.c5d.model.plan.enums.StopStatus
import io.github.bbsk.c5d.model.reference.entity.AccessNode
import io.github.bbsk.c5d.model.reference.entity.Building
import io.github.bbsk.c5d.model.reference.entity.ServiceCenter
import io.github.bbsk.c5d.model.reference.entity.WorkType
import io.github.bbsk.c5d.model.reference.enums.DeadlineKind
import io.github.bbsk.c5d.model.reference.enums.WorkTypeCode
import io.github.bbsk.c5d.model.solver.dto.SolverFrozenStopDto
import io.github.bbsk.c5d.repository.*
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDate
import java.time.OffsetDateTime
import java.util.UUID

@Service
class EventService(
    private val workDayRepository: WorkDayRepository,
    private val workOrderRepository: WorkOrderRepository,
    private val eventRepository: EventRepository,
    private val staffRepository: StaffRepository,
    private val routeRepository: RouteRepository,
    private val workTypeRepository: WorkTypeRepository,
    private val buildingRepository: BuildingRepository,
    private val accessNodeRepository: AccessNodeRepository,
    private val serviceCenterRepository: ServiceCenterRepository,
    private val planService: PlanService
) {

    @org.springframework.beans.factory.annotation.Autowired(required = false)
    private val objectMapper: ObjectMapper = ObjectMapper().registerModule(JavaTimeModule())

    @Transactional
    fun processEvent(targetDate: LocalDate, dto: EventInputDto): EventResultResponse {
        val day = workDayRepository.findByDate(targetDate)
            ?: throw NotFoundException("DAY_NOT_FOUND", "Рабочий день на дату '$targetDate' не найден")

        // Обновляем текущее время дня
        day.currentNow = dto.timestamp

        val eventCode = dto.code ?: "EV-${day.date.toString().replace("-", "")}-${UUID.randomUUID().toString().take(8)}"

        // 1. Формируем замороженную историю (frozen_stops) ДО внесения изменений
        val existingRoutes = routeRepository.findAllByDayId(day.id)
        val frozenStopsByStaffCode = mutableMapOf<String, MutableList<SolverFrozenStopDto>>()

        for (route in existingRoutes) {
            val staffCode = route.staff.code
            val frozenList = mutableListOf<SolverFrozenStopDto>()

            for (stop in route.stops) {
                // Если окончание остановки до или в момент события — она считается завершенной (историей)
                if (!stop.endTime.isAfter(dto.timestamp)) {
                    stop.status = StopStatus.DONE
                    frozenList.add(
                        SolverFrozenStopDto(
                            seq = stop.seq,
                            type = stop.type.name,
                            orderId = stop.order?.code,
                            buildingId = stop.locationCode,
                            arrival = stop.arrival,
                            start = stop.startTime,
                            end = stop.endTime,
                            travelSec = stop.travelSec,
                            equipmentAfter = mapOf(
                                "ONT" to (stop.equipmentAfterOnt ?: 0),
                                "ROUTER" to (stop.equipmentAfterRouter ?: 0),
                                "STB" to (stop.equipmentAfterStb ?: 0)
                            )
                        )
                    )
                }
            }
            if (frozenList.isNotEmpty()) {
                frozenStopsByStaffCode[staffCode] = frozenList
            }
        }

        // 2. Обработка полезной нагрузки события
        var resultMessage = "Событие обработано."

        when (dto.type) {
            EventType.ORDER_CANCELLED -> {
                val orderCode = dto.orderId
                    ?: throw BadRequestException("ORDER_ID_REQUIRED", "Для отмены наряда необходимо указать order_id")
                val order = workOrderRepository.findByCode(orderCode)
                    ?: throw NotFoundException("ORDER_NOT_FOUND", "Наряд '$orderCode' не найден")
                order.status = OrderStatus.CANCELLED
                workOrderRepository.save(order)
                resultMessage = "Наряд '$orderCode' отменен по причине: ${dto.reason ?: "CUSTOMER_REQUEST"}."
            }

            EventType.NEW_ORDER -> {
                val newOrderDto = dto.newOrder
                    ?: throw BadRequestException("NEW_ORDER_REQUIRED", "Для события NEW_ORDER обязательно поле new_order")
                val createdOrder = createNewOrder(newOrderDto, day)
                workOrderRepository.save(createdOrder)
                resultMessage = "Новый наряд '${createdOrder.code}' зарегистрирован со слотом ${createdOrder.slotStart} - ${createdOrder.slotEnd}."
            }

            EventType.STAFF_UNAVAILABLE -> {
                val staffRef = dto.staffId
                    ?: throw BadRequestException("STAFF_ID_REQUIRED", "Для события STAFF_UNAVAILABLE необходимо указать staff_id")
                val staff = resolveStaff(staffRef)
                    ?: throw NotFoundException("STAFF_NOT_FOUND", "Сотрудник '$staffRef' не найден")

                day.absentStaff.add(staff)
                workDayRepository.save(day)

                // Помечаем маршрут сотрудника как UNAVAILABLE
                val route = existingRoutes.find { it.staff.id == staff.id }
                if (route != null) {
                    route.status = RouteStatus.UNAVAILABLE
                    routeRepository.save(route)
                }

                resultMessage = "Сотрудник '${staff.code}' недоступен (${dto.reason ?: "ILLNESS"}). Невыполненные наряды перераспределяются."
            }

            EventType.ORDER_TRANSFERRED -> {
                val orderCode = dto.orderId
                    ?: throw BadRequestException("ORDER_ID_REQUIRED", "Для передачи наряда необходимо указать order_id")
                val order = workOrderRepository.findByCode(orderCode)
                    ?: throw NotFoundException("ORDER_NOT_FOUND", "Наряд '$orderCode' не найден")
                order.status = OrderStatus.CANCELLED
                workOrderRepository.save(order)
                resultMessage = "Наряд '$orderCode' передан в подразделение ${dto.transferredTo ?: "STATION"}."
            }

            EventType.VISIT_DELAYED -> {
                val orderCode = dto.orderId
                    ?: throw BadRequestException("ORDER_ID_REQUIRED", "Для задержки визита необходимо указать order_id")
                val delay = dto.delayMin ?: 30
                resultMessage = "Зафиксирована задержка визита '$orderCode' на $delay минут."
            }

            EventType.TIME_TICK -> {
                resultMessage = "Модельное время переведено на ${dto.timestamp}."
            }
        }

        // 3. Сохраняем сущность события
        val eventEntity = Event(
            day = day,
            code = eventCode,
            type = dto.type,
            timestamp = dto.timestamp,
            payload = objectMapper.writeValueAsString(dto)
        )
        val savedEvent = eventRepository.save(eventEntity)

        // 4. Запускаем автоматическое перепланирование
        val newPlan = planService.calculatePlan(targetDate, frozenStopsByStaffCode)

        // Фиксируем, что текущая версия плана построена на основе данного события
        day.basedOnEventId = savedEvent.code
        workDayRepository.save(day)

        return EventResultResponse(
            eventId = savedEvent.id,
            code = savedEvent.code,
            type = savedEvent.type,
            timestamp = savedEvent.timestamp,
            processedAt = OffsetDateTime.now(),
            message = resultMessage,
            plan = newPlan
        )
    }

    private fun createNewOrder(dto: DayOrderInputDto, day: WorkDay): WorkOrder {
        val code = dto.orderId.trim()
        val building = resolveBuilding(dto.buildingId.trim())
            ?: throw BadRequestException("BUILDING_NOT_FOUND", "Здание '${dto.buildingId}' не найдено")

        val workType = resolveWorkType(dto.workTypeId ?: dto.workTypeCode)
            ?: throw BadRequestException("WORK_TYPE_NOT_FOUND", "Тип работ не найден")

        val accessNode = if (!dto.accessNodeId.isNullOrBlank()) {
            resolveAccessNode(dto.accessNodeId.trim()) ?: building.accessNode
        } else {
            building.accessNode
        }

        val serviceCenter = if (!dto.serviceCenterId.isNullOrBlank()) {
            resolveServiceCenter(dto.serviceCenterId.trim()) ?: building.zoneServiceCenter
        } else {
            building.zoneServiceCenter
        }

        val resolvedSlotStart = dto.slot?.start ?: dto.slotStart
            ?: throw BadRequestException("SLOT_REQUIRED", "Для наряда '$code' не указано начало слота")
        val resolvedSlotEnd = dto.slot?.end ?: dto.slotEnd
            ?: throw BadRequestException("SLOT_REQUIRED", "Для наряда '$code' не указано окончание слота")

        val latestStart = dto.latestStart ?: calculateLatestStart(resolvedSlotStart, resolvedSlotEnd, workType)
        val deadline = dto.deadline ?: calculateDeadline(latestStart, resolvedSlotEnd, workType)

        return WorkOrder(
            code = code,
            day = day,
            serviceCenter = serviceCenter,
            workType = workType,
            building = building,
            accessNode = accessNode,
            registeredAt = dto.registeredAt,
            slotStart = resolvedSlotStart,
            slotEnd = resolvedSlotEnd,
            latestStart = latestStart,
            deadline = deadline,
            requiredOnt = dto.requiredEquipment?.ont ?: 0,
            requiredRouter = dto.requiredEquipment?.router ?: 0,
            requiredStb = dto.requiredEquipment?.stb ?: 0,
            isRepeat = dto.isRepeat,
            previousOrderId = dto.previousOrderId?.trim(),
            status = OrderStatus.PENDING
        )
    }

    private fun resolveStaff(ref: String): io.github.bbsk.c5d.model.reference.entity.Staff? {
        val uuid = try { UUID.fromString(ref) } catch (_: Exception) { null }
        if (uuid != null) {
            val byId = staffRepository.findById(uuid).orElse(null)
            if (byId != null) return byId
        }
        return staffRepository.findByCode(ref)
    }

    private fun resolveBuilding(ref: String): Building? {
        val uuid = try { UUID.fromString(ref) } catch (_: Exception) { null }
        if (uuid != null) {
            val byId = buildingRepository.findById(uuid).orElse(null)
            if (byId != null) return byId
        }
        return buildingRepository.findByCode(ref)
    }

    private fun resolveWorkType(ref: String?): WorkType? {
        if (ref.isNullOrBlank()) return null
        val uuid = try { UUID.fromString(ref) } catch (_: Exception) { null }
        if (uuid != null) {
            val byId = workTypeRepository.findById(uuid).orElse(null)
            if (byId != null) return byId
        }
        val enumCode = try { WorkTypeCode.valueOf(ref) } catch (_: Exception) { null }
        if (enumCode != null) {
            val byCode = workTypeRepository.findByCode(enumCode)
            if (byCode != null) return byCode
        }
        return null
    }

    private fun resolveAccessNode(ref: String): AccessNode? {
        val uuid = try { UUID.fromString(ref) } catch (_: Exception) { null }
        if (uuid != null) {
            val byId = accessNodeRepository.findById(uuid).orElse(null)
            if (byId != null) return byId
        }
        return accessNodeRepository.findByCode(ref)
    }

    private fun resolveServiceCenter(ref: String): ServiceCenter? {
        val uuid = try { UUID.fromString(ref) } catch (_: Exception) { null }
        if (uuid != null) {
            val byId = serviceCenterRepository.findById(uuid).orElse(null)
            if (byId != null) return byId
        }
        return serviceCenterRepository.findByCode(ref)
    }

    private fun calculateLatestStart(slotStart: OffsetDateTime, slotEnd: OffsetDateTime, workType: WorkType): OffsetDateTime {
        val maxDelay = workType.maxStartDelayMin ?: 120
        val candidate = slotStart.plusMinutes(maxDelay.toLong())
        return if (candidate.isBefore(slotEnd)) candidate else slotEnd
    }

    private fun calculateDeadline(latestStart: OffsetDateTime, slotEnd: OffsetDateTime, workType: WorkType): OffsetDateTime {
        return if (workType.deadlineKind == DeadlineKind.SLOT) {
            latestStart.plusMinutes(workType.durationMin.toLong())
        } else {
            slotEnd
        }
    }
}
