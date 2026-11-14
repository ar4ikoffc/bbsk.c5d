package io.github.bbsk.c5d.service

import io.github.bbsk.c5d.model.day.entity.WorkDay
import io.github.bbsk.c5d.model.day.entity.WorkOrder
import io.github.bbsk.c5d.model.day.enums.OrderStatus
import io.github.bbsk.c5d.model.plan.entity.Alert
import io.github.bbsk.c5d.model.plan.entity.PgpGroup
import io.github.bbsk.c5d.model.plan.enums.AlertStatus
import io.github.bbsk.c5d.model.plan.enums.AlertSuggestedAction
import io.github.bbsk.c5d.model.plan.enums.AlertType
import io.github.bbsk.c5d.model.plan.enums.PgpAction
import org.springframework.stereotype.Service
import java.time.Duration
import java.time.OffsetDateTime
import java.util.UUID

data class PgpDetectionResult(
    val groups: List<PgpGroup>,
    val alerts: List<Alert>,
    val affectedOrders: List<WorkOrder>
)

@Service
class PgpDetectorService {

    /**
     * Поиск подозрений на групповые проблемы (ПГП):
     * Правило H9: ≥ 3 аварийных нарядов (workType.pgpRelevant == true, т.е. REPAIR или DEGRADATION)
     * на одном узле доступа (access_node) за интервал времени регистрации ≤ 60 минут.
     */
    fun detect(day: WorkDay, orders: List<WorkOrder>, now: OffsetDateTime): PgpDetectionResult {
        val eligibleOrders = orders.filter { order ->
            order.status != OrderStatus.CANCELLED &&
                    order.workType.pgpRelevant
        }

        val byNode = eligibleOrders.groupBy { it.accessNode.id }

        val detectedGroups = mutableListOf<PgpGroup>()
        val createdAlerts = mutableListOf<Alert>()
        val affectedOrderList = mutableListOf<WorkOrder>()
        var seqCounter = 1

        for ((_, nodeOrders) in byNode) {
            if (nodeOrders.size < 3) continue

            // Сортировка по времени регистрации
            val sorted = nodeOrders.sortedBy { it.registeredAt }
            val node = sorted.first().accessNode

            // Поиск кластеров из ≥ 3 нарядов с окном ≤ 60 минут
            val clusters = findPgpClusters(sorted, Duration.ofMinutes(60))

            for (cluster in clusters) {
                val code = "PGP-${day.date.toString().replace("-", "")}-${node.code}-$seqCounter"
                val alertCode = "ALT-PGP-${day.date.toString().replace("-", "")}-${node.code}-$seqCounter"

                val group = PgpGroup(
                    code = code,
                    day = day,
                    accessNode = node,
                    detectedAt = now,
                    action = PgpAction.TRANSFER_TO_STATION,
                    comment = "Выявлено ${cluster.size} аварийных обращений на узле ${node.code} за интервал ≤ 60 минут. Наряды переданы в станционное подразделение.",
                    orders = cluster.toMutableSet()
                )
                detectedGroups.add(group)
                affectedOrderList.addAll(cluster)

                val alert = Alert(
                    code = alertCode,
                    day = day,
                    createdAt = now,
                    type = AlertType.PGP_DETECTED,
                    status = AlertStatus.ACTIVE,
                    suggestedAction = AlertSuggestedAction.TRANSFER_TO_STATION,
                    message = "Узел ${node.code} (${node.name}): подозрение на групповую аварию (${cluster.size} заявок за 60 мин). Наряды сняты с выездных бригад и направлены в станционную службу.",
                    applied = true
                )
                createdAlerts.add(alert)
                seqCounter++
            }
        }

        return PgpDetectionResult(
            groups = detectedGroups,
            alerts = createdAlerts,
            affectedOrders = affectedOrderList.distinctBy { it.id }
        )
    }

    private fun findPgpClusters(orders: List<WorkOrder>, maxWindow: Duration): List<List<WorkOrder>> {
        val result = mutableListOf<List<WorkOrder>>()
        val used = mutableSetOf<UUID>()

        for (i in orders.indices) {
            if (orders[i].id in used) continue

            val currentWindowOrders = mutableListOf<WorkOrder>()
            val startTime = orders[i].registeredAt

            for (j in i until orders.size) {
                val diff = Duration.between(startTime, orders[j].registeredAt).abs()
                if (diff <= maxWindow) {
                    currentWindowOrders.add(orders[j])
                }
            }

            if (currentWindowOrders.size >= 3) {
                // Найден кластер
                result.add(currentWindowOrders)
                used.addAll(currentWindowOrders.map { it.id })
            }
        }

        return result
    }
}
