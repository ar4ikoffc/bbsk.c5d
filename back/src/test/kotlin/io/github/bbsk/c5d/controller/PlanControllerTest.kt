package io.github.bbsk.c5d.controller

import io.github.bbsk.c5d.config.JwtAuthenticationFilter
import io.github.bbsk.c5d.config.JwtService
import io.github.bbsk.c5d.config.SecurityConfig
import io.github.bbsk.c5d.exception.GlobalExceptionHandler
import io.github.bbsk.c5d.exception.NotFoundException
import io.github.bbsk.c5d.model.plan.dto.response.PlanMetricsDto
import io.github.bbsk.c5d.model.plan.dto.response.PlanResponse
import io.github.bbsk.c5d.service.PlanService
import org.junit.jupiter.api.Test
import org.mockito.ArgumentMatchers.any
import org.mockito.Mockito.`when`
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest
import org.springframework.context.annotation.Import
import org.springframework.test.context.bean.override.mockito.MockitoBean
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.*
import java.time.LocalDate
import java.util.UUID

@WebMvcTest(PlanController::class)
@Import(GlobalExceptionHandler::class, SecurityConfig::class, JwtAuthenticationFilter::class)
class PlanControllerTest {

    @Autowired
    private lateinit var mockMvc: MockMvc

    @MockitoBean
    private lateinit var planService: PlanService

    @MockitoBean
    private lateinit var jwtService: JwtService

    private val targetDate = LocalDate.of(2026, 10, 26)

    private val samplePlanResponse = PlanResponse(
        dayId = UUID.randomUUID(),
        date = targetDate,
        planVersion = 1,
        routes = emptyList(),
        pgpGroups = emptyList(),
        unassignedOrders = emptyList(),
        alerts = emptyList(),
        metrics = PlanMetricsDto(
            totalOrders = 50,
            assignedOrders = 45,
            unassignedOrders = 5,
            pgpOrders = 0,
            activeRoutes = 10,
            totalTravelSec = 15000,
            avgTravelSecPerRoute = 1500.0
        )
    )

    @Test
    fun `calculatePlan returns 200 with plan response`() {
        `when`(planService.calculatePlan(any() ?: targetDate, any() ?: emptyMap())).thenReturn(samplePlanResponse)

        mockMvc.perform(post("/api/v1/days/{date}/plan", targetDate))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.date").value("2026-10-26"))
            .andExpect(jsonPath("$.metrics.total_orders").value(50))
            .andExpect(jsonPath("$.metrics.assigned_orders").value(45))
    }

    @Test
    fun `getPlan returns 200 when plan exists`() {
        `when`(planService.getPlan(any() ?: targetDate)).thenReturn(samplePlanResponse)

        mockMvc.perform(get("/api/v1/days/{date}/plan", targetDate))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.date").value("2026-10-26"))
            .andExpect(jsonPath("$.metrics.assigned_orders").value(45))
    }

    @Test
    fun `getPlan returns 404 when plan not found`() {
        `when`(planService.getPlan(any() ?: targetDate)).thenThrow(NotFoundException("PLAN_NOT_FOUND", "План не найден"))

        mockMvc.perform(get("/api/v1/days/{date}/plan", targetDate))
            .andExpect(status().isNotFound)
            .andExpect(jsonPath("$.error.code").value("PLAN_NOT_FOUND"))
    }
}
