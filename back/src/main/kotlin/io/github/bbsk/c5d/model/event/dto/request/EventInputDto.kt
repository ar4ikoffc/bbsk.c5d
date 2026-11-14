package io.github.bbsk.c5d.model.event.dto.request

import com.fasterxml.jackson.annotation.JsonProperty
import io.github.bbsk.c5d.model.day.dto.request.DayOrderInputDto
import io.github.bbsk.c5d.model.event.enums.EventType
import io.swagger.v3.oas.annotations.media.Schema
import jakarta.validation.constraints.NotNull
import java.time.OffsetDateTime

@Schema(description = "Входное внешнее событие в течение смены (Event-Driven Replanning)")
data class EventInputDto(
    @field:JsonProperty("type")
    @field:NotNull(message = "Тип события (type) обязателен")
    @field:Schema(description = "Тип внешнего события", example = "ORDER_CANCELLED", requiredMode = Schema.RequiredMode.REQUIRED)
    val type: EventType,

    @field:JsonProperty("timestamp")
    @field:NotNull(message = "Модельное время события (timestamp) обязательно")
    @field:Schema(description = "Модельное время возникновения события", example = "2026-10-26T11:15:00+05:00", requiredMode = Schema.RequiredMode.REQUIRED)
    val timestamp: OffsetDateTime,

    @field:JsonProperty("code")
    @field:Schema(description = "Внешний идентификатор события", example = "EV-20261026-001")
    val code: String? = null,

    @field:JsonProperty("order_id")
    @field:Schema(description = "Код наряда (для событий ORDER_CANCELLED, ORDER_TRANSFERRED, VISIT_DELAYED)", example = "ORD-20261026-0001")
    val orderId: String? = null,

    @field:JsonProperty("staff_id")
    @field:Schema(description = "Код сотрудника (для события STAFF_UNAVAILABLE)", example = "ST-003")
    val staffId: String? = null,

    @field:JsonProperty("reason")
    @field:Schema(description = "Причина отмены или недоступности", example = "NOT_CONFIRMED")
    val reason: String? = null,

    @field:JsonProperty("delay_min")
    @field:Schema(description = "Длительность задержки на объекте в минутах (для VISIT_DELAYED)", example = "30")
    val delayMin: Int? = null,

    @field:JsonProperty("transferred_to")
    @field:Schema(description = "Подразделение передачи (для ORDER_TRANSFERRED)", example = "STATION")
    val transferredTo: String? = null,

    @field:JsonProperty("new_order")
    @field:Schema(description = "Данные нового наряда (для события NEW_ORDER)")
    val newOrder: DayOrderInputDto? = null
)
