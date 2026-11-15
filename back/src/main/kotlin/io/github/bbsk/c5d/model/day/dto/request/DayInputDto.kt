package io.github.bbsk.c5d.model.day.dto.request

import com.fasterxml.jackson.annotation.JsonProperty
import io.swagger.v3.oas.annotations.media.Schema
import jakarta.validation.Valid
import java.time.LocalDate
import java.time.OffsetDateTime

@Schema(description = "Пакетная инициализация рабочего дня: заказы и отсутствующие сотрудники")
data class DayInputDto(
    @field:JsonProperty("date")
    @field:Schema(description = "Календарная дата рабочего дня (если не указана, берется из пути запроса)", example = "2026-10-26")
    val date: LocalDate? = null,

    @field:JsonProperty("now")
    @field:Schema(description = "Текущее модельное время начала планирования дня", example = "2026-10-26T08:00:00+05:00")
    val now: OffsetDateTime? = null,

    @field:JsonProperty("orders")
    @field:Valid
    @field:Schema(description = "Пул нарядов на данный день")
    val orders: List<DayOrderInputDto> = emptyList(),

    @field:JsonProperty("absent_staff")
    @field:Schema(
        description = "Список отсутствующих сотрудников (UUID или коды вроде ST-001)",
        example = "[\"ST-003\", \"ST-015\"]"
    )
    val absentStaff: List<String> = emptyList()
)
