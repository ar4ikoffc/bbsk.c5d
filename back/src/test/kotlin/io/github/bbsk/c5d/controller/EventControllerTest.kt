package io.github.bbsk.c5d.controller

import io.github.bbsk.c5d.config.JwtAuthenticationFilter
import io.github.bbsk.c5d.config.JwtService
import io.github.bbsk.c5d.config.SecurityConfig
import io.github.bbsk.c5d.exception.GlobalExceptionHandler
import io.github.bbsk.c5d.model.event.dto.request.EventInputDto
import io.github.bbsk.c5d.model.event.dto.response.EventResultResponse
import io.github.bbsk.c5d.model.event.enums.EventType
import io.github.bbsk.c5d.model.plan.dto.response.PlanMetricsDto
import io.github.bbsk.c5d.model.plan.dto.response.PlanResponse
import io.github.bbsk.c5d.service.EventService
import org.junit.jupiter.api.Test
import org.mockito.ArgumentMatchers.any
import org.mockito.Mockito.`when`
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest
import org.springframework.context.annotation.Import
import org.springframework.http.MediaType
import org.springframework.test.context.bean.override.mockito.MockitoBean
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.*
import java.time.LocalDate
import java.time.OffsetDateTime
import java.time.ZoneOffset
import java.util.UUID

@WebMvcTest(EventController::class)
@Import(GlobalExceptionHandler::class, SecurityConfig::class, JwtAuthenticationFilter::class)
class EventControllerTest {

    @Autowired
    private lateinit var mockMvc: MockMvc

    @MockitoBean
    private lateinit var eventService: EventService

    @MockitoBean
    private lateinit var jwtService: JwtService

    private val targetDate = LocalDate.of(2026, 10, 26)
    private val eventTime = OffsetDateTime.of(2026, 10, 26, 11, 30, 0, 0, ZoneOffset.ofHours(5))

    private val dummyEventInput = EventInputDto(
        type = EventType.ORDER_CANCELLED,
        timestamp = eventTime,
        orderId = "ORD-001"
    )

    private val samplePlanResponse = PlanResponse(
        dayId = UUID.randomUUID(),
        date = targetDate,
        planVersion = 2,
        routes = emptyList(),
        pgpGroups = emptyList(),
        unassignedOrders = emptyList(),
        alerts = emptyList(),
        metrics = PlanMetricsDto(
            totalOrders = 49,
            assignedOrders = 44,
            unassignedOrders = 5,
            pgpOrders = 0,
            activeRoutes = 10,
            totalTravelSec = 14500,
            avgTravelSecPerRoute = 1450.0
        )
    )

    private val sampleEventResult = EventResultResponse(
        eventId = UUID.randomUUID(),
        code = "EV-001",
        type = EventType.ORDER_CANCELLED,
        timestamp = eventTime,
        processedAt = eventTime,
        message = "Наряд ORD-001 отменен",
        plan = samplePlanResponse
    )

    @Test
    fun `processEvent returns 200 with updated plan`() {
        `when`(eventService.processEvent(any() ?: targetDate, any() ?: dummyEventInput)).thenReturn(sampleEventResult)

        val json = """
            {
                "type": "ORDER_CANCELLED",
                "timestamp": "2026-10-26T11:30:00+05:00",
                "order_id": "ORD-001",
                "reason": "CUSTOMER_REQUEST"
            }
        """.trimIndent()

        mockMvc.perform(
            post("/api/v1/days/{date}/events", targetDate)
                .contentType(MediaType.APPLICATION_JSON)
                .content(json)
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.type").value("ORDER_CANCELLED"))
            .andExpect(jsonPath("$.plan.plan_version").value(2))
            .andExpect(jsonPath("$.message").value("Наряд ORD-001 отменен"))
    }
}
