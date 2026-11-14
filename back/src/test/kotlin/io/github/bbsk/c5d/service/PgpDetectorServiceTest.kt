package io.github.bbsk.c5d.service

import io.github.bbsk.c5d.model.day.entity.WorkDay
import io.github.bbsk.c5d.model.day.entity.WorkOrder
import io.github.bbsk.c5d.model.day.enums.OrderStatus
import io.github.bbsk.c5d.model.reference.entity.AccessNode
import io.github.bbsk.c5d.model.reference.entity.Building
import io.github.bbsk.c5d.model.reference.entity.WorkType
import io.github.bbsk.c5d.model.reference.enums.AccessNodeType
import io.github.bbsk.c5d.model.reference.enums.BuildingType
import io.github.bbsk.c5d.model.reference.enums.DeadlineKind
import io.github.bbsk.c5d.model.reference.enums.Technology
import io.github.bbsk.c5d.model.reference.enums.WorkTypeCode
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import java.time.LocalDate
import java.time.OffsetDateTime
import java.time.ZoneOffset
import java.util.UUID

class PgpDetectorServiceTest {

    private val detector = PgpDetectorService()

    private val day = WorkDay(
        date = LocalDate.of(2026, 10, 26),
        currentNow = OffsetDateTime.of(2026, 10, 26, 8, 0, 0, 0, ZoneOffset.ofHours(5))
    )

    private val nodeA = AccessNode(
        code = "AN-001",
        name = "Узел А",
        nodeType = AccessNodeType.SWITCH,
        technology = Technology.FTTB,
        address = "ул. Ленина, 1",
        lat = 56.83,
        lon = 60.60
    )

    private val nodeB = AccessNode(
        code = "AN-002",
        name = "Узел Б",
        nodeType = AccessNodeType.SWITCH,
        technology = Technology.FTTB,
        address = "ул. Мира, 2",
        lat = 56.84,
        lon = 60.62
    )

    private val buildingA = Building(
        code = "B-001",
        accessNode = nodeA,
        address = "ул. Ленина, 1",
        lat = 56.83,
        lon = 60.60,
        buildingType = BuildingType.MKD
    )

    private val repairWorkType = WorkType(
        code = WorkTypeCode.REPAIR,
        name = "Устранение неисправности",
        durationMin = 60,
        deadlineKind = DeadlineKind.HOURS,
        deadlineValue = 24,
        pgpRelevant = true
    )

    private val installWorkType = WorkType(
        code = WorkTypeCode.INST_PON_MKD,
        name = "Инсталляция PON",
        durationMin = 90,
        deadlineKind = DeadlineKind.WORKING_DAYS,
        deadlineValue = 3,
        pgpRelevant = false
    )

    private fun createOrder(
        code: String,
        node: AccessNode,
        workType: WorkType,
        registeredAt: OffsetDateTime
    ): WorkOrder {
        val slotStart = registeredAt.plusHours(2)
        val slotEnd = slotStart.plusHours(2)
        return WorkOrder(
            id = UUID.randomUUID(),
            code = code,
            day = day,
            serviceCenter = null,
            workType = workType,
            building = buildingA,
            accessNode = node,
            registeredAt = registeredAt,
            slotStart = slotStart,
            slotEnd = slotEnd,
            latestStart = slotEnd,
            deadline = slotEnd.plusHours(4),
            status = OrderStatus.PENDING
        )
    }

    @Test
    fun `detects PGP when 3 repair orders occur on same node within 50 minutes`() {
        val baseTime = OffsetDateTime.of(2026, 10, 26, 10, 0, 0, 0, ZoneOffset.ofHours(5))

        val o1 = createOrder("ORD-1", nodeA, repairWorkType, baseTime)
        val o2 = createOrder("ORD-2", nodeA, repairWorkType, baseTime.plusMinutes(20))
        val o3 = createOrder("ORD-3", nodeA, repairWorkType, baseTime.plusMinutes(45))

        val result = detector.detect(day, listOf(o1, o2, o3), baseTime.plusHours(1))

        assertEquals(1, result.groups.size)
        assertEquals(1, result.alerts.size)
        assertEquals(3, result.affectedOrders.size)
        assertTrue(result.groups.first().code.startsWith("PGP-20261026-AN-001"))
    }

    @Test
    fun `does not detect PGP when only 2 repair orders exist on node`() {
        val baseTime = OffsetDateTime.of(2026, 10, 26, 10, 0, 0, 0, ZoneOffset.ofHours(5))

        val o1 = createOrder("ORD-1", nodeA, repairWorkType, baseTime)
        val o2 = createOrder("ORD-2", nodeA, repairWorkType, baseTime.plusMinutes(20))

        val result = detector.detect(day, listOf(o1, o2), baseTime.plusHours(1))

        assertEquals(0, result.groups.size)
        assertEquals(0, result.alerts.size)
    }

    @Test
    fun `does not detect PGP when 3 repair orders are spread across 90 minutes`() {
        val baseTime = OffsetDateTime.of(2026, 10, 26, 10, 0, 0, 0, ZoneOffset.ofHours(5))

        val o1 = createOrder("ORD-1", nodeA, repairWorkType, baseTime)
        val o2 = createOrder("ORD-2", nodeA, repairWorkType, baseTime.plusMinutes(40))
        val o3 = createOrder("ORD-3", nodeA, repairWorkType, baseTime.plusMinutes(90))

        val result = detector.detect(day, listOf(o1, o2, o3), baseTime.plusHours(2))

        assertEquals(0, result.groups.size)
    }

    @Test
    fun `does not detect PGP when 3 orders are on different access nodes`() {
        val baseTime = OffsetDateTime.of(2026, 10, 26, 10, 0, 0, 0, ZoneOffset.ofHours(5))

        val o1 = createOrder("ORD-1", nodeA, repairWorkType, baseTime)
        val o2 = createOrder("ORD-2", nodeA, repairWorkType, baseTime.plusMinutes(10))
        val o3 = createOrder("ORD-3", nodeB, repairWorkType, baseTime.plusMinutes(15))

        val result = detector.detect(day, listOf(o1, o2, o3), baseTime.plusHours(1))

        assertEquals(0, result.groups.size)
    }

    @Test
    fun `does not detect PGP for non-pgpRelevant work types like INSTALL`() {
        val baseTime = OffsetDateTime.of(2026, 10, 26, 10, 0, 0, 0, ZoneOffset.ofHours(5))

        val o1 = createOrder("ORD-1", nodeA, installWorkType, baseTime)
        val o2 = createOrder("ORD-2", nodeA, installWorkType, baseTime.plusMinutes(10))
        val o3 = createOrder("ORD-3", nodeA, installWorkType, baseTime.plusMinutes(20))

        val result = detector.detect(day, listOf(o1, o2, o3), baseTime.plusHours(1))

        assertEquals(0, result.groups.size)
    }
}
