package io.github.bbsk.c5d.repository

import io.github.bbsk.c5d.model.plan.entity.Route
import org.springframework.data.jpa.repository.EntityGraph
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.util.Optional
import java.util.UUID

@Repository
interface RouteRepository : JpaRepository<Route, UUID> {
    @EntityGraph(attributePaths = ["day", "staff", "serviceCenter", "stops", "stops.order"])
    override fun findById(id: UUID): Optional<Route>

    @EntityGraph(attributePaths = ["day", "staff", "serviceCenter", "stops", "stops.order"])
    fun findAllByDayId(dayId: UUID): List<Route>

    @EntityGraph(attributePaths = ["day", "staff", "serviceCenter", "stops", "stops.order"])
    fun findByDayIdAndStaffId(dayId: UUID, staffId: UUID): Route?

    fun deleteAllByDayId(dayId: UUID): Long
}
