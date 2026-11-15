package io.github.bbsk.c5d.controller

import io.github.bbsk.c5d.config.JwtAuthenticationFilter
import io.github.bbsk.c5d.config.JwtService
import io.github.bbsk.c5d.config.SecurityConfig
import io.github.bbsk.c5d.exception.ConflictException
import io.github.bbsk.c5d.exception.GlobalExceptionHandler
import io.github.bbsk.c5d.exception.NotFoundException
import io.github.bbsk.c5d.model.day.dto.response.WorkOrderResponse
import io.github.bbsk.c5d.model.day.enums.OrderStatus
import io.github.bbsk.c5d.model.reference.dto.EquipmentDto
import io.github.bbsk.c5d.model.reference.enums.BuildingType
import io.github.bbsk.c5d.model.reference.enums.WorkTypeCode
import io.github.bbsk.c5d.service.WorkOrderService
import org.junit.jupiter.api.Test
import org.mockito.ArgumentMatchers.any
import org.mockito.ArgumentMatchers.eq
import org.mockito.Mockito.*
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest
import org.springframework.context.annotation.Import
import org.springframework.http.MediaType
import org.springframework.test.context.bean.override.mockito.MockitoBean
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.*
import java.time.LocalDate
import java.time.OffsetDateTime
import java.time.ZoneOffset
import java.util.UUID

@WebMvcTest(OrderController::class)
@Import(GlobalExceptionHandler::class, SecurityConfig::class, JwtAuthenticationFilter::class)
class OrderControllerTest {

    @Autowired
    private lateinit var mockMvc: MockMvc

    @MockitoBean
    private lateinit var workOrderService: WorkOrderService

    @MockitoBean
    private lateinit var jwtService: JwtService

    private val sampleOrderId = UUID.randomUUID()
    private val sampleDayId = UUID.randomUUID()
    private val sampleWorkTypeId = UUID.randomUUID()
    private val sampleBuildingId = UUID.randomUUID()
    private val sampleAccessNodeId = UUID.randomUUID()
    private val sampleServiceCenterId = UUID.randomUUID()

    private val sampleOrderResponse = WorkOrderResponse(
        id = sampleOrderId,
        orderId = "ORD-20261026-0001",
        dayId = sampleDayId,
        dayDate = LocalDate.of(2026, 10, 26),
        serviceCenterId = sampleServiceCenterId,
        serviceCenterCode = "SC-01",
        workTypeId = sampleWorkTypeId,
        workTypeCode = WorkTypeCode.INST_PON_MKD,
        workTypeName = "Инсталляция ШПД/IPTV, многоквартирный дом, PON",
        buildingId = sampleBuildingId,
        buildingCode = "B-00412",
        address = "г. Екатеринбург, ул. Учителей, 18",
        lat = 56.8712,
        lon = 60.6531,
        buildingType = BuildingType.MKD,
        requiresHeight = false,
        accessNodeId = sampleAccessNodeId,
        accessNodeCode = "AN-0031",
        registeredAt = OffsetDateTime.of(2026, 10, 25, 14, 30, 0, 0, ZoneOffset.ofHours(5)),
        slot = io.github.bbsk.c5d.model.day.dto.TimeWindowDto(
            start = OffsetDateTime.of(2026, 10, 26, 9, 0, 0, 0, ZoneOffset.ofHours(5)),
            end = OffsetDateTime.of(2026, 10, 26, 11, 0, 0, 0, ZoneOffset.ofHours(5))
        ),
        slotStart = OffsetDateTime.of(2026, 10, 26, 9, 0, 0, 0, ZoneOffset.ofHours(5)),
        slotEnd = OffsetDateTime.of(2026, 10, 26, 11, 0, 0, 0, ZoneOffset.ofHours(5)),
        latestStart = OffsetDateTime.of(2026, 10, 26, 9, 10, 0, 0, ZoneOffset.ofHours(5)),
        deadline = OffsetDateTime.of(2026, 10, 26, 10, 10, 0, 0, ZoneOffset.ofHours(5)),
        requiredEquipment = EquipmentDto(ont = 0, router = 1, stb = 0),
        isRepeat = false,
        previousOrderId = null,
        status = OrderStatus.PENDING
    )

    @Test
    fun `GET orders returns list of orders`() {
        `when`(workOrderService.getAll(any(), any(), any(), any(), any())).thenReturn(listOf(sampleOrderResponse))

        mockMvc.perform(get("/api/v1/orders"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$[0].id").value(sampleOrderId.toString()))
            .andExpect(jsonPath("$[0].order_id").value("ORD-20261026-0001"))
            .andExpect(jsonPath("$[0].work_type_code").value("INST_PON_MKD"))
            .andExpect(jsonPath("$[0].status").value("PENDING"))
    }

    @Test
    fun `GET order by id returns 200 when found`() {
        `when`(workOrderService.getById(sampleOrderId)).thenReturn(sampleOrderResponse)

        mockMvc.perform(get("/api/v1/orders/$sampleOrderId"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.id").value(sampleOrderId.toString()))
            .andExpect(jsonPath("$.order_id").value("ORD-20261026-0001"))
            .andExpect(jsonPath("$.address").value("г. Екатеринбург, ул. Учителей, 18"))
    }

    @Test
    fun `GET order by id returns 404 when not found`() {
        `when`(workOrderService.getById(sampleOrderId)).thenThrow(
            NotFoundException("ORDER_NOT_FOUND", "Наряд не найден")
        )

        mockMvc.perform(get("/api/v1/orders/$sampleOrderId"))
            .andExpect(status().isNotFound)
            .andExpect(jsonPath("$.code").value("ORDER_NOT_FOUND"))
    }

    @Test
    fun `POST order creates and returns 201`() {
        `when`(workOrderService.create(any())).thenReturn(sampleOrderResponse)

        val jsonBody = """
            {
                "order_id": "ORD-20261026-0001",
                "day_id": "$sampleDayId",
                "work_type_id": "$sampleWorkTypeId",
                "building_id": "$sampleBuildingId",
                "registered_at": "2026-10-25T14:30:00+05:00",
                "slot_start": "2026-10-26T09:00:00+05:00",
                "slot_end": "2026-10-26T11:00:00+05:00",
                "required_equipment": {
                    "ONT": 0,
                    "ROUTER": 1,
                    "STB": 0
                }
            }
        """.trimIndent()

        mockMvc.perform(
            post("/api/v1/orders")
                .contentType(MediaType.APPLICATION_JSON)
                .content(jsonBody)
        )
            .andExpect(status().isCreated)
            .andExpect(jsonPath("$.id").value(sampleOrderId.toString()))
            .andExpect(jsonPath("$.order_id").value("ORD-20261026-0001"))
    }

    @Test
    fun `POST order returns 409 when order code already exists`() {
        `when`(workOrderService.create(any())).thenThrow(
            ConflictException("ORDER_ALREADY_EXISTS", "Наряд с кодом уже существует")
        )

        val jsonBody = """
            {
                "order_id": "ORD-20261026-0001",
                "day_id": "$sampleDayId",
                "work_type_id": "$sampleWorkTypeId",
                "building_id": "$sampleBuildingId",
                "registered_at": "2026-10-25T14:30:00+05:00",
                "slot_start": "2026-10-26T09:00:00+05:00",
                "slot_end": "2026-10-26T11:00:00+05:00"
            }
        """.trimIndent()

        mockMvc.perform(
            post("/api/v1/orders")
                .contentType(MediaType.APPLICATION_JSON)
                .content(jsonBody)
        )
            .andExpect(status().isConflict)
            .andExpect(jsonPath("$.code").value("ORDER_ALREADY_EXISTS"))
    }

    @Test
    fun `PUT order updates and returns 200`() {
        val updatedResponse = sampleOrderResponse.copy(status = OrderStatus.ASSIGNED)
        `when`(workOrderService.update(eq(sampleOrderId), any())).thenReturn(updatedResponse)

        val jsonBody = """
            {
                "status": "ASSIGNED"
            }
        """.trimIndent()

        mockMvc.perform(
            put("/api/v1/orders/$sampleOrderId")
                .contentType(MediaType.APPLICATION_JSON)
                .content(jsonBody)
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.status").value("ASSIGNED"))
    }

    @Test
    fun `DELETE order returns 204 No Content`() {
        doNothing().`when`(workOrderService).delete(sampleOrderId)

        mockMvc.perform(delete("/api/v1/orders/$sampleOrderId"))
            .andExpect(status().isNoContent)
    }
}
