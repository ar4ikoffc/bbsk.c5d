package io.github.bbsk.c5d.repository

import io.github.bbsk.c5d.model.plan.entity.Alert
import io.github.bbsk.c5d.model.plan.enums.AlertStatus
import io.github.bbsk.c5d.model.plan.enums.AlertType
import org.springframework.data.jpa.repository.EntityGraph
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.util.Optional
import java.util.UUID

@Repository
interface AlertRepository : JpaRepository<Alert, UUID> {
    @EntityGraph(attributePaths = ["day", "order", "staff"])
    override fun findById(id: UUID): Optional<Alert>

    @EntityGraph(attributePaths = ["day", "order", "staff"])
    fun findByCode(code: String): Alert?

    @EntityGraph(attributePaths = ["day", "order", "staff"])
    fun findAllByDayId(dayId: UUID): List<Alert>

    @EntityGraph(attributePaths = ["day", "order", "staff"])
    fun findAllByDayIdAndStatus(dayId: UUID, status: AlertStatus): List<Alert>

    @EntityGraph(attributePaths = ["day", "order", "staff"])
    fun findAllByDayIdAndType(dayId: UUID, type: AlertType): List<Alert>

    fun deleteAllByDayId(dayId: UUID): Long
}
