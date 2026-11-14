package io.github.bbsk.c5d.controller

import io.github.bbsk.c5d.model.common.dto.ErrorResponse
import io.github.bbsk.c5d.model.plan.dto.response.PlanResponse
import io.github.bbsk.c5d.service.PlanService
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.Parameter
import io.swagger.v3.oas.annotations.media.Content
import io.swagger.v3.oas.annotations.media.Schema
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.responses.ApiResponses
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.format.annotation.DateTimeFormat
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.time.LocalDate

@Tag(
    name = "План смены (Plan)",
    description = "Расчет и получение суточного плана распределения нарядов по выездным инженерам и оптимизированных маршрутов"
)
@RestController
@RequestMapping("/api/v1/days/{date}/plan")
class PlanController(
    private val planService: PlanService
) {

    @Operation(
        summary = "Рассчитать оптимальный план смены",
        description = "Запускает процедуру оптимизации: выявление ПГП, изоляцию недоступных инженеров, вызов Python Solver и сохранение маршрутов."
    )
    @ApiResponses(
        value = [
            ApiResponse(
                responseCode = "200",
                description = "План успешно рассчитан и сохранен",
                content = [Content(schema = Schema(implementation = PlanResponse::class))]
            ),
            ApiResponse(
                responseCode = "404",
                description = "Рабочий день не найден",
                content = [Content(schema = Schema(implementation = ErrorResponse::class))]
            ),
            ApiResponse(
                responseCode = "503",
                description = "Сервис солвера недоступен",
                content = [Content(schema = Schema(implementation = ErrorResponse::class))]
            )
        ]
    )
    @PostMapping
    fun calculatePlan(
        @Parameter(description = "Календарная дата дня (YYYY-MM-DD)", example = "2026-10-26")
        @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) date: LocalDate
    ): ResponseEntity<PlanResponse> {
        val plan = planService.calculatePlan(date)
        return ResponseEntity.ok(plan)
    }

    @Operation(
        summary = "Получить текущий план смены",
        description = "Возвращает последний сохраненный план для указанного рабочего дня (без повторного пересчета)."
    )
    @ApiResponses(
        value = [
            ApiResponse(
                responseCode = "200",
                description = "План успешно получен",
                content = [Content(schema = Schema(implementation = PlanResponse::class))]
            ),
            ApiResponse(
                responseCode = "404",
                description = "Рабочий день или план не найден",
                content = [Content(schema = Schema(implementation = ErrorResponse::class))]
            )
        ]
    )
    @GetMapping
    fun getPlan(
        @Parameter(description = "Календарная дата дня (YYYY-MM-DD)", example = "2026-10-26")
        @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) date: LocalDate
    ): ResponseEntity<PlanResponse> {
        val plan = planService.getPlan(date)
        return ResponseEntity.ok(plan)
    }
}
