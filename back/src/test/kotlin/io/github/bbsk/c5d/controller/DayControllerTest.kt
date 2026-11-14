package io.github.bbsk.c5d.controller

import io.github.bbsk.c5d.config.JwtAuthenticationFilter
import io.github.bbsk.c5d.config.JwtService
import io.github.bbsk.c5d.config.SecurityConfig
import io.github.bbsk.c5d.exception.GlobalExceptionHandler
import io.github.bbsk.c5d.exception.NotFoundException
import io.github.bbsk.c5d.model.day.dto.request.DayInputDto
import io.github.bbsk.c5d.model.day.dto.response.DayResponse
import io.github.bbsk.c5d.service.DayService
import org.junit.jupiter.api.Test
import org.mockito.ArgumentMatchers.any
import org.mockito.ArgumentMatchers.eq
import org.mockito.Mockito.`when`
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest
import org.springframework.context.annotation.Import
import org.springframework.http.MediaType
import org.springframework.test.context.bean.override.mockito.MockitoBean
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.*
import java.time.LocalDate
import java.time.OffsetDateTime
import java.time.ZoneOffset
import java.util.UUID

@WebMvcTest(DayController::class)
@Import(GlobalExceptionHandler::class, SecurityConfig::class, JwtAuthenticationFilter::class)
class DayControllerTest {

    @Autowired
    private lateinit var mockMvc: MockMvc

    @MockitoBean
    private lateinit var dayService: DayService

    @MockitoBean
    private lateinit var jwtService: JwtService

    private val targetDate = LocalDate.of(2026, 10, 26)
    private val sampleResponse = DayResponse(
        id = UUID.randomUUID(),
        date = targetDate,
        currentNow = OffsetDateTime.of(2026, 10, 26, 8, 0, 0, 0, ZoneOffset.ofHours(5)),
        planVersion = 1,
        basedOnEventId = null,
        ordersCount = 10,
        absentStaffCount = 1,
        absentStaffCodes = listOf("ST-003")
    )

    @Test
    fun `initializeDay returns 200 with day response`() {
        `when`(dayService.initializeDay(any() ?: targetDate, any() ?: DayInputDto())).thenReturn(sampleResponse)

        val json = """
            {
                "date": "2026-10-26",
                "now": "2026-10-26T08:00:00+05:00",
                "orders": [
                    {
                        "order_id": "ORD-20261026-0001",
                        "building_id": "B-00412",
                        "work_type": "INST_PON_MKD",
                        "registered_at": "2026-10-25T14:30:00+05:00",
                        "slot": {
                            "start": "2026-10-26T09:00:00+05:00",
                            "end": "2026-10-26T11:00:00+05:00"
                        }
                    }
                ],
                "absent_staff": ["ST-003"]
            }
        """.trimIndent()

        mockMvc.perform(
            put("/api/v1/days/{date}", targetDate)
                .contentType(MediaType.APPLICATION_JSON)
                .content(json)
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.date").value("2026-10-26"))
            .andExpect(jsonPath("$.orders_count").value(10))
            .andExpect(jsonPath("$.absent_staff_count").value(1))
            .andExpect(jsonPath("$.absent_staff_codes[0]").value("ST-003"))
    }

    @Test
    fun `getDay returns 200 when day exists`() {
        `when`(dayService.getDay(targetDate)).thenReturn(sampleResponse)

        mockMvc.perform(get("/api/v1/days/{date}", targetDate))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.date").value("2026-10-26"))
            .andExpect(jsonPath("$.orders_count").value(10))
    }

    @Test
    fun `getDay returns 404 when day not found`() {
        `when`(dayService.getDay(targetDate)).thenThrow(NotFoundException("DAY_NOT_FOUND", "Рабочий день не найден"))

        mockMvc.perform(get("/api/v1/days/{date}", targetDate))
            .andExpect(status().isNotFound)
            .andExpect(jsonPath("$.error.code").value("DAY_NOT_FOUND"))
    }
}
