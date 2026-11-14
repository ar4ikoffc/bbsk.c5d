package io.github.bbsk.c5d.model.day.dto.request

import com.fasterxml.jackson.annotation.JsonProperty
import io.github.bbsk.c5d.model.day.enums.OrderStatus
import io.github.bbsk.c5d.model.reference.dto.EquipmentDto
import io.swagger.v3.oas.annotations.media.Schema
import java.time.OffsetDateTime
import java.util.UUID

@Schema(description = "Запрос на частичное или полное обновление наряда на работы")
data class UpdateWorkOrderRequest(
    @field:JsonProperty("status")
    @field:Schema(
        description = "Новый статус наряда (PENDING, ASSIGNED, COMPLETED, CANCELLED, UNASSIGNED)",
        example = "ASSIGNED"
    )
    val status: OrderStatus? = null,

    @field:JsonProperty("work_type_id")
    @field:Schema(
        description = "Новый UUID типа работ",
        example = "c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f"
    )
    val workTypeId: UUID? = null,

    @field:JsonProperty("building_id")
    @field:Schema(
        description = "Новый UUID обслуживаемого здания/объекта",
        example = "4ba85f64-5717-4562-b3fc-2c963f66afa7"
    )
    val buildingId: UUID? = null,

    @field:JsonProperty("access_node_id")
    @field:Schema(
        description = "Новый UUID узла доступа связи",
        example = "2ea85f64-5717-4562-b3fc-2c963f66afa5"
    )
    val accessNodeId: UUID? = null,

    @field:JsonProperty("service_center_id")
    @field:Schema(
        description = "Новый UUID сервисного центра (или null для очистки)",
        example = "1fa85f64-5717-4562-b3fc-2c963f66afa4"
    )
    val serviceCenterId: UUID? = null,

    @field:JsonProperty("registered_at")
    @field:Schema(
        description = "Скорректированное время регистрации",
        example = "2026-10-25T14:30:00+05:00"
    )
    val registeredAt: OffsetDateTime? = null,

    @field:JsonProperty("slot_start")
    @field:Schema(
        description = "Новое время начала согласованного слота",
        example = "2026-10-26T10:00:00+05:00"
    )
    val slotStart: OffsetDateTime? = null,

    @field:JsonProperty("slot_end")
    @field:Schema(
        description = "Новое время окончания согласованного слота",
        example = "2026-10-26T12:00:00+05:00"
    )
    val slotEnd: OffsetDateTime? = null,

    @field:JsonProperty("latest_start")
    @field:Schema(
        description = "Новый крайний срок начала выполнения работ",
        example = "2026-10-26T10:10:00+05:00"
    )
    val latestStart: OffsetDateTime? = null,

    @field:JsonProperty("deadline")
    @field:Schema(
        description = "Новый контрольный срок выполнения",
        example = "2026-10-26T11:10:00+05:00"
    )
    val deadline: OffsetDateTime? = null,

    @field:JsonProperty("required_ont")
    @field:Schema(description = "Требуемое количество ONT", example = "1")
    val requiredOnt: Int? = null,

    @field:JsonProperty("required_router")
    @field:Schema(description = "Требуемое количество роутеров", example = "1")
    val requiredRouter: Int? = null,

    @field:JsonProperty("required_stb")
    @field:Schema(description = "Требуемое количество ТВ-приставок", example = "1")
    val requiredStb: Int? = null,

    @field:JsonProperty("required_equipment")
    @field:Schema(description = "Агрегированная потребность в оборудовании (при передаче обновляет ONT, ROUTER, STB)")
    val requiredEquipment: EquipmentDto? = null,

    @field:JsonProperty("is_repeat")
    @field:Schema(description = "Признак повторного обращения", example = "true")
    val isRepeat: Boolean? = null,

    @field:JsonProperty("previous_order_id")
    @field:Schema(description = "Код предыдущего наряда абонента", example = "ORD-20261020-0045")
    val previousOrderId: String? = null
)
