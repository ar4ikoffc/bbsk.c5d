package io.github.bbsk.c5d.repository

import io.github.bbsk.c5d.model.event.entity.Event
import io.github.bbsk.c5d.model.event.enums.EventType
import org.springframework.data.jpa.repository.EntityGraph
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.util.Optional
import java.util.UUID

@Repository
interface EventRepository : JpaRepository<Event, UUID> {
    @EntityGraph(attributePaths = ["day"])
    override fun findById(id: UUID): Optional<Event>

    @EntityGraph(attributePaths = ["day"])
    fun findAllByDayId(dayId: UUID): List<Event>

    @EntityGraph(attributePaths = ["day"])
    fun findAllByDayIdAndType(dayId: UUID, type: EventType): List<Event>
}
