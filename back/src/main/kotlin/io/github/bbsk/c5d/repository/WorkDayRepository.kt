package io.github.bbsk.c5d.repository

import io.github.bbsk.c5d.model.day.entity.WorkDay
import org.springframework.data.jpa.repository.EntityGraph
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.time.LocalDate
import java.util.Optional
import java.util.UUID

@Repository
interface WorkDayRepository : JpaRepository<WorkDay, UUID> {
    @EntityGraph(attributePaths = ["absentStaff"])
    override fun findById(id: UUID): Optional<WorkDay>

    @EntityGraph(attributePaths = ["absentStaff"])
    fun findByDate(date: LocalDate): WorkDay?

    fun existsByDate(date: LocalDate): Boolean
}
