package io.github.bbsk.c5d.model.solver.dto

import com.fasterxml.jackson.annotation.JsonProperty
import java.time.OffsetDateTime

data class SolverRequestDto(
    @field:JsonProperty("date")
    val date: String,

    @field:JsonProperty("now")
    val now: OffsetDateTime,

    @field:JsonProperty("service_centers")
    val serviceCenters: List<SolverServiceCenterDto>,

    @field:JsonProperty("staff")
    val staff: List<SolverStaffDto>,

    @field:JsonProperty("orders")
    val orders: List<SolverOrderDto>
)

data class SolverServiceCenterDto(
    @field:JsonProperty("id")
    val id: String,

    @field:JsonProperty("building_id")
    val buildingId: String,

    @field:JsonProperty("open_from")
    val openFrom: String,

    @field:JsonProperty("open_to")
    val openTo: String,

    @field:JsonProperty("restock_duration_min")
    val restockDurationMin: Int
)

data class SolverStaffDto(
    @field:JsonProperty("staff_id")
    val staffId: String,

    @field:JsonProperty("service_center_id")
    val serviceCenterId: String,

    @field:JsonProperty("profiles")
    val profiles: List<String>,

    @field:JsonProperty("technologies")
    val technologies: List<String>,

    @field:JsonProperty("height_permit")
    val heightPermit: Boolean,

    @field:JsonProperty("shift")
    val shift: SolverShiftDto,

    @field:JsonProperty("equipment_start")
    val equipmentStart: Map<String, Int>,

    @field:JsonProperty("equipment_capacity")
    val equipmentCapacity: Map<String, Int>,

    @field:JsonProperty("frozen_stops")
    val frozenStops: List<SolverFrozenStopDto> = emptyList()
)

data class SolverShiftDto(
    @field:JsonProperty("start")
    val start: String,

    @field:JsonProperty("end")
    val end: String,

    @field:JsonProperty("break_duration_min")
    val breakDurationMin: Int = 60,

    @field:JsonProperty("break_window")
    val breakWindow: SolverBreakWindowDto
)

data class SolverBreakWindowDto(
    @field:JsonProperty("from")
    val from: String,

    @field:JsonProperty("to")
    val to: String
)

data class SolverFrozenStopDto(
    @field:JsonProperty("seq")
    val seq: Int,

    @field:JsonProperty("type")
    val type: String,

    @field:JsonProperty("order_id")
    val orderId: String? = null,

    @field:JsonProperty("building_id")
    val buildingId: String,

    @field:JsonProperty("arrival")
    val arrival: OffsetDateTime,

    @field:JsonProperty("start")
    val start: OffsetDateTime,

    @field:JsonProperty("end")
    val end: OffsetDateTime,

    @field:JsonProperty("travel_sec")
    val travelSec: Int = 0,

    @field:JsonProperty("equipment_after")
    val equipmentAfter: Map<String, Int> = emptyMap()
)

data class SolverOrderDto(
    @field:JsonProperty("order_id")
    val orderId: String,

    @field:JsonProperty("building_id")
    val buildingId: String,

    @field:JsonProperty("work_type")
    val workType: String,

    @field:JsonProperty("profiles")
    val profiles: List<String>,

    @field:JsonProperty("technology")
    val technology: String? = null,

    @field:JsonProperty("requires_height")
    val requiresHeight: Boolean = false,

    @field:JsonProperty("duration_min")
    val durationMin: Int,

    @field:JsonProperty("slot")
    val slot: SolverSlotDto,

    @field:JsonProperty("latest_start")
    val latestStart: OffsetDateTime,

    @field:JsonProperty("deadline")
    val deadline: OffsetDateTime,

    @field:JsonProperty("required_equipment")
    val requiredEquipment: Map<String, Int>,

    @field:JsonProperty("is_repeat")
    val isRepeat: Boolean = false
)

data class SolverSlotDto(
    @field:JsonProperty("start")
    val start: OffsetDateTime,

    @field:JsonProperty("end")
    val end: OffsetDateTime
)
