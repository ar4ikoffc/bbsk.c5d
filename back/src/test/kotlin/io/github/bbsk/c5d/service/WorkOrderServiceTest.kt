package io.github.bbsk.c5d.service

import io.github.bbsk.c5d.exception.ConflictException
import io.github.bbsk.c5d.exception.NotFoundException
import io.github.bbsk.c5d.model.day.dto.request.CreateWorkOrderRequest
import io.github.bbsk.c5d.model.day.dto.request.UpdateWorkOrderRequest
import io.github.bbsk.c5d.model.day.entity.WorkDay
import io.github.bbsk.c5d.model.day.entity.WorkOrder
import io.github.bbsk.c5d.model.day.enums.OrderStatus
import io.github.bbsk.c5d.model.reference.dto.EquipmentDto
import io.github.bbsk.c5d.model.reference.entity.AccessNode
import io.github.bbsk.c5d.model.reference.entity.Building
import io.github.bbsk.c5d.model.reference.entity.ServiceCenter
import io.github.bbsk.c5d.model.reference.entity.WorkType
import io.github.bbsk.c5d.model.reference.enums.*
import io.github.bbsk.c5d.repository.*
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.ArgumentMatchers.any
import org.mockito.Mock
import org.mockito.Mockito.*
import org.mockito.junit.jupiter.MockitoExtension
import org.springframework.data.jpa.domain.Specification
import java.time.LocalDate
import java.time.LocalTime
import java.time.OffsetDateTime
import java.time.ZoneOffset
import java.util.Optional
import java.util.UUID

@ExtendWith(MockitoExtension::class)
class WorkOrderServiceTest {

    @Mock
    private lateinit var workOrderRepository: WorkOrderRepository

    @Mock
    private lateinit var workDayRepository: WorkDayRepository

    @Mock
    private lateinit var workTypeRepository: WorkTypeRepository

    @Mock
    private lateinit var buildingRepository: BuildingRepository

    @Mock
    private lateinit var accessNodeRepository: AccessNodeRepository

    @Mock
    private lateinit var serviceCenterRepository: ServiceCenterRepository

    private lateinit var workOrderService: WorkOrderService

    private val sampleDayId = UUID.randomUUID()
    private val sampleWorkTypeId = UUID.randomUUID()
    private val sampleBuildingId = UUID.randomUUID()
    private val sampleAccessNodeId = UUID.randomUUID()
    private val sampleServiceCenterId = UUID.randomUUID()
    private val sampleOrderId = UUID.randomUUID()

    private val sampleDate = LocalDate.of(2026, 10, 26)
    private val sampleRegisteredAt = OffsetDateTime.of(2026, 10, 25, 14, 30, 0, 0, ZoneOffset.ofHours(5))
    private val sampleSlotStart = OffsetDateTime.of(2026, 10, 26, 9, 0, 0, 0, ZoneOffset.ofHours(5))
    private val sampleSlotEnd = OffsetDateTime.of(2026, 10, 26, 11, 0, 0, 0, ZoneOffset.ofHours(5))

    private lateinit var sampleDay: WorkDay
    private lateinit var sampleServiceCenter: ServiceCenter
    private lateinit var sampleAccessNode: AccessNode
    private lateinit var sampleBuilding: Building
    private lateinit var sampleWorkType: WorkType
    private lateinit var sampleOrder: WorkOrder

    @BeforeEach
    fun setUp() {
        workOrderService = WorkOrderService(
            workOrderRepository = workOrderRepository,
            workDayRepository = workDayRepository,
            workTypeRepository = workTypeRepository,
            buildingRepository = buildingRepository,
            accessNodeRepository = accessNodeRepository,
            serviceCenterRepository = serviceCenterRepository
        )

        sampleDay = WorkDay(
            id = sampleDayId,
            date = sampleDate,
            currentNow = sampleSlotStart.withHour(8).withMinute(30)
        )

        sampleServiceCenter = ServiceCenter(
            id = sampleServiceCenterId,
            code = "SC-01",
            name = "Центральный СЦ",
            address = "ул. Ленина, 1",
            lat = 56.8389,
            lon = 60.6057,
            openTime = LocalTime.of(8, 0),
            closeTime = LocalTime.of(20, 0)
        )

        sampleAccessNode = AccessNode(
            id = sampleAccessNodeId,
            code = "AN-0031",
            name = "Узел 31",
            address = "ул. Учителей, 10",
            lat = 56.8710,
            lon = 60.6530,
            nodeType = AccessNodeType.OLT,
            technology = Technology.PON
        )

        sampleBuilding = Building(
            id = sampleBuildingId,
            code = "B-00412",
            accessNode = sampleAccessNode,
            zoneServiceCenter = sampleServiceCenter,
            address = "г. Екатеринбург, ул. Учителей, 18",
            lat = 56.8712,
            lon = 60.6531,
            buildingType = BuildingType.MKD,
            overheadLine = false
        )

        sampleWorkType = WorkType(
            id = sampleWorkTypeId,
            code = WorkTypeCode.INST_PON_MKD,
            name = "Инсталляция ШПД/IPTV, многоквартирный дом, PON",
            durationMin = 60,
            maxStartDelayMin = 10,
            deadlineKind = DeadlineKind.SLOT,
            profiles = mutableSetOf(Profile.INSTALL)
        )

        sampleOrder = WorkOrder(
            id = sampleOrderId,
            code = "ORD-20261026-0001",
            day = sampleDay,
            serviceCenter = sampleServiceCenter,
            workType = sampleWorkType,
            building = sampleBuilding,
            accessNode = sampleAccessNode,
            registeredAt = sampleRegisteredAt,
            slotStart = sampleSlotStart,
            slotEnd = sampleSlotEnd,
            latestStart = sampleSlotStart.plusMinutes(10),
            deadline = sampleSlotStart.plusMinutes(70),
            requiredOnt = 0,
            requiredRouter = 1,
            requiredStb = 0,
            isRepeat = false,
            previousOrderId = null,
            status = OrderStatus.PENDING
        )
    }

    @Test
    fun `getAll returns mapped orders list`() {
        `when`(workOrderRepository.findAll(any<Specification<WorkOrder>>())).thenReturn(listOf(sampleOrder))

        val result = workOrderService.getAll(date = sampleDate, status = OrderStatus.PENDING)

        assertEquals(1, result.size)
        assertEquals("ORD-20261026-0001", result[0].orderId)
        assertEquals(sampleBuildingId, result[0].buildingId)
        assertEquals(1, result[0].requiredEquipment.router)
        assertEquals(OrderStatus.PENDING, result[0].status)
    }

    @Test
    fun `getById returns order when found`() {
        `when`(workOrderRepository.findById(sampleOrderId)).thenReturn(Optional.of(sampleOrder))

        val result = workOrderService.getById(sampleOrderId)

        assertEquals(sampleOrderId, result.id)
        assertEquals("ORD-20261026-0001", result.orderId)
        assertEquals(sampleWorkTypeId, result.workTypeId)
    }

    @Test
    fun `getById throws NotFoundException when order not found`() {
        `when`(workOrderRepository.findById(sampleOrderId)).thenReturn(Optional.empty())

        val ex = assertThrows(NotFoundException::class.java) {
            workOrderService.getById(sampleOrderId)
        }
        assertEquals("ORDER_NOT_FOUND", ex.code)
    }

    @Test
    fun `getByCode returns order when found`() {
        `when`(workOrderRepository.findByCode("ORD-20261026-0001")).thenReturn(sampleOrder)

        val result = workOrderService.getByCode("ORD-20261026-0001")

        assertEquals(sampleOrderId, result.id)
        assertEquals("ORD-20261026-0001", result.orderId)
    }

    @Test
    fun `create successfully saves and calculates defaults`() {
        val request = CreateWorkOrderRequest(
            orderId = "ORD-20261026-0001",
            dayId = sampleDayId,
            workTypeId = sampleWorkTypeId,
            buildingId = sampleBuildingId,
            registeredAt = sampleRegisteredAt,
            slotStart = sampleSlotStart,
            slotEnd = sampleSlotEnd,
            requiredEquipment = EquipmentDto(ont = 0, router = 1, stb = 0)
        )

        `when`(workOrderRepository.existsByCode("ORD-20261026-0001")).thenReturn(false)
        `when`(workTypeRepository.findById(sampleWorkTypeId)).thenReturn(Optional.of(sampleWorkType))
        `when`(buildingRepository.findById(sampleBuildingId)).thenReturn(Optional.of(sampleBuilding))
        `when`(workDayRepository.findById(sampleDayId)).thenReturn(Optional.of(sampleDay))
        `when`(workOrderRepository.save(any())).thenReturn(sampleOrder)

        val response = workOrderService.create(request)

        assertNotNull(response)
        assertEquals("ORD-20261026-0001", response.orderId)
        assertEquals(sampleBuildingId, response.buildingId)
        assertEquals(sampleAccessNodeId, response.accessNodeId)
        assertEquals(sampleServiceCenterId, response.serviceCenterId)
        verify(workOrderRepository, times(1)).save(any())
    }

    @Test
    fun `create throws ConflictException if code already exists`() {
        val request = CreateWorkOrderRequest(
            orderId = "ORD-20261026-0001",
            dayId = sampleDayId,
            workTypeId = sampleWorkTypeId,
            buildingId = sampleBuildingId,
            registeredAt = sampleRegisteredAt,
            slotStart = sampleSlotStart,
            slotEnd = sampleSlotEnd
        )

        `when`(workOrderRepository.existsByCode("ORD-20261026-0001")).thenReturn(true)

        val ex = assertThrows(ConflictException::class.java) {
            workOrderService.create(request)
        }
        assertEquals("ORDER_ALREADY_EXISTS", ex.code)
    }

    @Test
    fun `create throws NotFoundException if building not found`() {
        val request = CreateWorkOrderRequest(
            orderId = "ORD-20261026-0001",
            dayId = sampleDayId,
            workTypeId = sampleWorkTypeId,
            buildingId = sampleBuildingId,
            registeredAt = sampleRegisteredAt,
            slotStart = sampleSlotStart,
            slotEnd = sampleSlotEnd
        )

        `when`(workOrderRepository.existsByCode("ORD-20261026-0001")).thenReturn(false)
        `when`(workTypeRepository.findById(sampleWorkTypeId)).thenReturn(Optional.of(sampleWorkType))
        `when`(buildingRepository.findById(sampleBuildingId)).thenReturn(Optional.empty())

        val ex = assertThrows(NotFoundException::class.java) {
            workOrderService.create(request)
        }
        assertEquals("BUILDING_NOT_FOUND", ex.code)
    }

    @Test
    fun `update modifies fields and saves order`() {
        val request = UpdateWorkOrderRequest(
            status = OrderStatus.ASSIGNED,
            requiredRouter = 2,
            isRepeat = true,
            previousOrderId = "ORD-20261020-0045"
        )

        `when`(workOrderRepository.findById(sampleOrderId)).thenReturn(Optional.of(sampleOrder))
        `when`(workOrderRepository.save(any())).thenAnswer { it.arguments[0] }

        val response = workOrderService.update(sampleOrderId, request)

        assertEquals(OrderStatus.ASSIGNED, response.status)
        assertEquals(2, response.requiredEquipment.router)
        assertTrue(response.isRepeat)
        assertEquals("ORD-20261020-0045", response.previousOrderId)
    }

    @Test
    fun `delete removes order when found`() {
        `when`(workOrderRepository.findById(sampleOrderId)).thenReturn(Optional.of(sampleOrder))
        doNothing().`when`(workOrderRepository).delete(sampleOrder)

        assertDoesNotThrow { workOrderService.delete(sampleOrderId) }
        verify(workOrderRepository, times(1)).delete(sampleOrder)
    }
}
