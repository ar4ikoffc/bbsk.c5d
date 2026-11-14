package io.github.bbsk.c5d.repository

import io.github.bbsk.c5d.model.plan.entity.UnassignedOrder
import org.springframework.data.jpa.repository.EntityGraph
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.util.Optional
import java.util.UUID

@Repository
interface UnassignedOrderRepository : JpaRepository<UnassignedOrder, UUID> {
    @EntityGraph(attributePaths = ["day", "order"])
    override fun findById(id: UUID): Optional<UnassignedOrder>

    @EntityGraph(attributePaths = ["day", "order"])
    fun findAllByDayId(dayId: UUID): List<UnassignedOrder>

    fun deleteAllByDayId(dayId: UUID): Long
}
