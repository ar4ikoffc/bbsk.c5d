package io.github.bbsk.c5d.repository

import io.github.bbsk.c5d.model.plan.entity.RouteStop
import org.springframework.data.jpa.repository.EntityGraph
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.util.Optional
import java.util.UUID

@Repository
interface RouteStopRepository : JpaRepository<RouteStop, UUID> {
    @EntityGraph(attributePaths = ["route", "order"])
    override fun findById(id: UUID): Optional<RouteStop>

    @EntityGraph(attributePaths = ["route", "order"])
    fun findAllByRouteId(routeId: UUID): List<RouteStop>
}
