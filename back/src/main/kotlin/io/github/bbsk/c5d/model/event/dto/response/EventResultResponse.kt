package io.github.bbsk.c5d.model.event.dto.response

import com.fasterxml.jackson.annotation.JsonProperty
import io.github.bbsk.c5d.model.event.enums.EventType
import io.github.bbsk.c5d.model.plan.dto.response.PlanResponse
import io.swagger.v3.oas.annotations.media.Schema
import java.time.OffsetDateTime
import java.util.UUID

@Schema(description = "Результат обработки внешнего события и обновленный план смены")
data class EventResultResponse(
    @field:JsonProperty("event_id")
    @field:Schema(description = "UUID зарегистрированного события")
    val eventId: UUID,

    @field:JsonProperty("code")
    @field:Schema(description = "Код события", example = "EV-20261026-001")
    val code: String,

    @field:JsonProperty("type")
    @field:Schema(description = "Тип события", example = "ORDER_CANCELLED")
    val type: EventType,

    @field:JsonProperty("timestamp")
    @field:Schema(description = "Модельное время наступления события")
    val timestamp: OffsetDateTime,

    @field:JsonProperty("processed_at")
    @field:Schema(description = "Системное время обработки")
    val processedAt: OffsetDateTime,

    @field:JsonProperty("message")
    @field:Schema(description = "Результат обработки", example = "Наряд ORD-001 отменен, маршруты перепланированы")
    val message: String,

    @field:JsonProperty("plan")
    @field:Schema(description = "Актуализированный план смены с учетом заморозки истории")
    val plan: PlanResponse
)
