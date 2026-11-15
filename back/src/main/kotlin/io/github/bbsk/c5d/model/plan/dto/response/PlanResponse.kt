package io.github.bbsk.c5d.model.plan.dto.response

import com.fasterxml.jackson.annotation.JsonProperty
import io.github.bbsk.c5d.model.plan.enums.*
import io.swagger.v3.oas.annotations.media.Schema
import java.time.LocalDate
import java.time.OffsetDateTime
import java.util.UUID

@Schema(description = "Итоговый план распределения нарядов и маршрутизации")
data class PlanResponse(
    @field:JsonProperty("day_id")
    val dayId: UUID,

    @field:JsonProperty("date")
    val date: LocalDate,

    @field:JsonProperty("plan_version")
    val planVersion: Int,

    @field:JsonProperty("routes")
    val routes: List<RoutePlanResponse>,

    @field:JsonProperty("pgp_groups")
    val pgpGroups: List<PgpGroupPlanResponse>,

    @field:JsonProperty("unassigned_orders")
    val unassignedOrders: List<UnassignedOrderPlanResponse>,

    @field:JsonProperty("alerts")
    val alerts: List<AlertPlanResponse>,

    @field:JsonProperty("metrics")
    val metrics: PlanMetricsDto
)

data class RoutePlanResponse(
    @field:JsonProperty("route_id")
    val routeId: UUID,

    @field:JsonProperty("staff_id")
    val staffId: UUID,

    @field:JsonProperty("staff_code")
    val staffCode: String,

    @field:JsonProperty("staff_name")
    val staffName: String,

    @field:JsonProperty("service_center_code")
    val serviceCenterCode: String,

    @field:JsonProperty("status")
    val status: RouteStatus,

    @field:JsonProperty("stops")
    val stops: List<StopPlanResponse>,

    @field:JsonProperty("total_travel_sec")
    val totalTravelSec: Int,

    @field:JsonProperty("total_work_min")
    val totalWorkMin: Int,

    @field:JsonProperty("total_orders")
    val totalOrders: Int
)

data class StopPlanResponse(
    @field:JsonProperty("id")
    val id: UUID,

    @field:JsonProperty("seq")
    val seq: Int,

    @field:JsonProperty("type")
    val type: StopType,

    @field:JsonProperty("order_id")
    val orderId: UUID? = null,

    @field:JsonProperty("order_code")
    val orderCode: String? = null,

    @field:JsonProperty("location_code")
    val locationCode: String,

    @field:JsonProperty("arrival")
    val arrival: OffsetDateTime,

    @field:JsonProperty("start_time")
    val startTime: OffsetDateTime,

    @field:JsonProperty("end_time")
    val endTime: OffsetDateTime,

    @field:JsonProperty("travel_sec")
    val travelSec: Int,

    @field:JsonProperty("status")
    val status: StopStatus,

    @field:JsonProperty("equipment_after")
    val equipmentAfter: Map<String, Int>
)

data class PgpGroupPlanResponse(
    @field:JsonProperty("id")
    val id: UUID,

    @field:JsonProperty("code")
    val code: String,

    @field:JsonProperty("access_node_code")
    val accessNodeCode: String,

    @field:JsonProperty("order_codes")
    val orderCodes: List<String>,

    @field:JsonProperty("detected_at")
    val detectedAt: OffsetDateTime,

    @field:JsonProperty("action")
    val action: PgpAction,

    @field:JsonProperty("comment")
    val comment: String? = null
)

data class UnassignedOrderPlanResponse(
    @field:JsonProperty("id")
    val id: UUID,

    @field:JsonProperty("order_id")
    val orderId: UUID,

    @field:JsonProperty("order_code")
    val orderCode: String,

    @field:JsonProperty("reason_code")
    val reasonCode: UnassignedReasonCode,

    @field:JsonProperty("reason_text")
    val reasonText: String,

    @field:JsonProperty("suggested_action")
    val suggestedAction: SuggestedAction,

    @field:JsonProperty("since")
    val since: OffsetDateTime
)

data class AlertPlanResponse(
    @field:JsonProperty("id")
    val id: UUID,

    @field:JsonProperty("code")
    val code: String,

    @field:JsonProperty("type")
    val type: AlertType,

    @field:JsonProperty("status")
    val status: AlertStatus,

    @field:JsonProperty("suggested_action")
    val suggestedAction: AlertSuggestedAction? = null,

    @field:JsonProperty("order_id")
    val orderId: UUID? = null,

    @field:JsonProperty("staff_id")
    val staffId: UUID? = null,

    @field:JsonProperty("message")
    val message: String,

    @field:JsonProperty("created_at")
    val createdAt: OffsetDateTime
)

data class PlanMetricsDto(
    @field:JsonProperty("total_orders")
    val totalOrders: Int,

    @field:JsonProperty("assigned_orders")
    val assignedOrders: Int,

    @field:JsonProperty("unassigned_orders")
    val unassignedOrders: Int,

    @field:JsonProperty("pgp_orders")
    val pgpOrders: Int,

    @field:JsonProperty("active_routes")
    val activeRoutes: Int,

    @field:JsonProperty("total_travel_sec")
    val totalTravelSec: Int,

    @field:JsonProperty("avg_travel_sec_per_route")
    val avgTravelSecPerRoute: Double
)
