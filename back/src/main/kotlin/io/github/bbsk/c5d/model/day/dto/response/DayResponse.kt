package io.github.bbsk.c5d.model.day.dto.response

import com.fasterxml.jackson.annotation.JsonProperty
import io.swagger.v3.oas.annotations.media.Schema
import java.time.LocalDate
import java.time.OffsetDateTime
import java.util.UUID

@Schema(description = "Информация о рабочем дне")
data class DayResponse(
    @field:JsonProperty("id")
    @field:Schema(description = "UUID рабочего дня", example = "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d")
    val id: UUID,

    @field:JsonProperty("date")
    @field:Schema(description = "Календарная дата дня", example = "2026-10-26")
    val date: LocalDate,

    @field:JsonProperty("current_now")
    @field:Schema(description = "Текущее модельное время дня", example = "2026-10-26T08:00:00+05:00")
    val currentNow: OffsetDateTime,

    @field:JsonProperty("plan_version")
    @field:Schema(description = "Версия плана дня", example = "1")
    val planVersion: Int,

    @field:JsonProperty("based_on_event_id")
    @field:Schema(description = "Идентификатор события, на котором основана текущая версия плана", example = "EV-001")
    val basedOnEventId: String? = null,

    @field:JsonProperty("orders_count")
    @field:Schema(description = "Количество нарядов на этот день", example = "150")
    val ordersCount: Int,

    @field:JsonProperty("absent_staff_count")
    @field:Schema(description = "Количество отсутствующих сотрудников", example = "2")
    val absentStaffCount: Int,

    @field:JsonProperty("absent_staff_codes")
    @field:Schema(description = "Коды отсутствующих сотрудников", example = "[\"ST-003\", \"ST-015\"]")
    val absentStaffCodes: List<String> = emptyList()
)
