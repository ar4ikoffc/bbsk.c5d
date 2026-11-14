package io.github.bbsk.c5d.controller

import io.github.bbsk.c5d.model.common.dto.ErrorResponse
import io.github.bbsk.c5d.model.day.dto.request.DayInputDto
import io.github.bbsk.c5d.model.day.dto.response.DayResponse
import io.github.bbsk.c5d.service.DayService
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.Parameter
import io.swagger.v3.oas.annotations.media.Content
import io.swagger.v3.oas.annotations.media.Schema
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.responses.ApiResponses
import io.swagger.v3.oas.annotations.tags.Tag
import jakarta.validation.Valid
import org.springframework.format.annotation.DateTimeFormat
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.time.LocalDate

@Tag(
    name = "Рабочие дни (Days)",
    description = "Пакетная инициализация и управление контекстом рабочего дня: заказы, отсутствующие сотрудники, сброс предыдущих планов"
)
@RestController
@RequestMapping("/api/v1/days")
class DayController(
    private val dayService: DayService
) {

    @Operation(
        summary = "Пакетная инициализация дня",
        description = "Инициализирует или полностью перезаписывает данные рабочего дня: удаляет старые маршруты, алерты и наряды этого дня, загружает новый пул заказов и фиксирует список отсутствующих сотрудников."
    )
    @ApiResponses(
        value = [
            ApiResponse(
                responseCode = "200",
                description = "День успешно инициализирован",
                content = [Content(schema = Schema(implementation = DayResponse::class))]
            ),
            ApiResponse(
                responseCode = "400",
                description = "Ошибки валидации или отсутствие связанных сущностей (здание, тип работ)",
                content = [Content(schema = Schema(implementation = ErrorResponse::class))]
            )
        ]
    )
    @PutMapping("/{date}")
    fun initializeDay(
        @Parameter(description = "Календарная дата рабочего дня (YYYY-MM-DD)", example = "2026-10-26")
        @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) date: LocalDate,

        @Valid @RequestBody request: DayInputDto
    ): ResponseEntity<DayResponse> {
        val response = dayService.initializeDay(date, request)
        return ResponseEntity.ok(response)
    }

    @Operation(
        summary = "Получить информацию о рабочем дне",
        description = "Возвращает текущие параметры рабочего дня: версию плана, количество нарядов и состав отсутствующих сотрудников."
    )
    @ApiResponses(
        value = [
            ApiResponse(
                responseCode = "200",
                description = "Информация о дне получена",
                content = [Content(schema = Schema(implementation = DayResponse::class))]
            ),
            ApiResponse(
                responseCode = "404",
                description = "Рабочий день не найден",
                content = [Content(schema = Schema(implementation = ErrorResponse::class))]
            )
        ]
    )
    @GetMapping("/{date}")
    fun getDay(
        @Parameter(description = "Календарная дата рабочего дня (YYYY-MM-DD)", example = "2026-10-26")
        @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) date: LocalDate
    ): ResponseEntity<DayResponse> {
        val response = dayService.getDay(date)
        return ResponseEntity.ok(response)
    }
}
