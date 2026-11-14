package io.github.bbsk.c5d.repository

import io.github.bbsk.c5d.model.day.entity.WorkOrder
import io.github.bbsk.c5d.model.day.enums.OrderStatus
import org.springframework.data.jpa.domain.Specification
import org.springframework.data.jpa.repository.EntityGraph
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.JpaSpecificationExecutor
import org.springframework.stereotype.Repository
import java.time.LocalDate
import java.util.Optional
import java.util.UUID

@Repository
interface WorkOrderRepository : JpaRepository<WorkOrder, UUID>, JpaSpecificationExecutor<WorkOrder> {
    @EntityGraph(attributePaths = ["day", "serviceCenter", "workType", "building", "building.zoneServiceCenter", "accessNode"])
    override fun findById(id: UUID): Optional<WorkOrder>

    @EntityGraph(attributePaths = ["day", "serviceCenter", "workType", "building", "building.zoneServiceCenter", "accessNode"])
    fun findByCode(code: String): WorkOrder?

    fun existsByCode(code: String): Boolean

    @EntityGraph(attributePaths = ["day", "serviceCenter", "workType", "building", "building.zoneServiceCenter", "accessNode"])
    override fun findAll(): List<WorkOrder>

    @EntityGraph(attributePaths = ["day", "serviceCenter", "workType", "building", "building.zoneServiceCenter", "accessNode"])
    override fun findAll(spec: Specification<WorkOrder>): List<WorkOrder>

    @EntityGraph(attributePaths = ["day", "serviceCenter", "workType", "building", "building.zoneServiceCenter", "accessNode"])
    fun findAllByDayId(dayId: UUID): List<WorkOrder>

    @EntityGraph(attributePaths = ["day", "serviceCenter", "workType", "building", "building.zoneServiceCenter", "accessNode"])
    fun findAllByDayDate(date: LocalDate): List<WorkOrder>

    @EntityGraph(attributePaths = ["day", "serviceCenter", "workType", "building", "building.zoneServiceCenter", "accessNode"])
    fun findAllByStatus(status: OrderStatus): List<WorkOrder>

    fun existsByDayId(dayId: UUID): Boolean
    fun existsByWorkTypeId(workTypeId: UUID): Boolean
    fun existsByBuildingId(buildingId: UUID): Boolean
    fun existsByAccessNodeId(accessNodeId: UUID): Boolean
    fun existsByServiceCenterId(serviceCenterId: UUID): Boolean
}
