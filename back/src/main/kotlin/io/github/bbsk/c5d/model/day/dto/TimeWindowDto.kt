package io.github.bbsk.c5d.model.day.dto

import com.fasterxml.jackson.annotation.JsonProperty
import io.swagger.v3.oas.annotations.media.Schema
import java.time.OffsetDateTime

@Schema(description = "Временное окно / согласованный интервал")
data class TimeWindowDto(
    @field:JsonProperty("start")
    @field:Schema(description = "Начало интервала", example = "2026-10-26T09:00:00+05:00", requiredMode = Schema.RequiredMode.REQUIRED)
    val start: OffsetDateTime,

    @field:JsonProperty("end")
    @field:Schema(description = "Окончание интервала", example = "2026-10-26T11:00:00+05:00", requiredMode = Schema.RequiredMode.REQUIRED)
    val end: OffsetDateTime
)
