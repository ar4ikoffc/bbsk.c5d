package io.github.bbsk.c5d.repository

import io.github.bbsk.c5d.model.plan.entity.PgpGroup
import org.springframework.data.jpa.repository.EntityGraph
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.util.Optional
import java.util.UUID

@Repository
interface PgpGroupRepository : JpaRepository<PgpGroup, UUID> {
    @EntityGraph(attributePaths = ["day", "accessNode", "orders"])
    override fun findById(id: UUID): Optional<PgpGroup>

    @EntityGraph(attributePaths = ["day", "accessNode", "orders"])
    fun findByCode(code: String): PgpGroup?

    @EntityGraph(attributePaths = ["day", "accessNode", "orders"])
    fun findAllByDayId(dayId: UUID): List<PgpGroup>

    fun deleteAllByDayId(dayId: UUID): Long
}
