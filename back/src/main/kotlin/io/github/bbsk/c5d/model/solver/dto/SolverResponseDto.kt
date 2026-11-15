package io.github.bbsk.c5d.model.solver.dto

import com.fasterxml.jackson.annotation.JsonProperty
import java.time.OffsetDateTime

data class SolverResponseDto(
    @field:JsonProperty("status")
    val status: String,

    @field:JsonProperty("execution_time_ms")
    val executionTimeMs: Int,

    @field:JsonProperty("routes")
    val routes: List<SolverRouteDto> = emptyList(),

    @field:JsonProperty("unassigned_orders")
    val unassignedOrders: List<SolverUnassignedDto> = emptyList()
)

data class SolverRouteDto(
    @field:JsonProperty("staff_id")
    val staffId: String,

    @field:JsonProperty("stops")
    val stops: List<SolverStopDto> = emptyList(),

    @field:JsonProperty("total_travel_sec")
    val totalTravelSec: Int,

    @field:JsonProperty("total_work_min")
    val totalWorkMin: Int,

    @field:JsonProperty("total_orders")
    val totalOrders: Int
)

data class SolverStopDto(
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

data class SolverUnassignedDto(
    @field:JsonProperty("order_id")
    val orderId: String,

    @field:JsonProperty("reason")
    val reason: String
)
