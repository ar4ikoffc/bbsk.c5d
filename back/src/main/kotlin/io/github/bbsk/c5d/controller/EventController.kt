package io.github.bbsk.c5d.controller

import io.github.bbsk.c5d.model.common.dto.ErrorResponse
import io.github.bbsk.c5d.model.event.dto.request.EventInputDto
import io.github.bbsk.c5d.model.event.dto.response.EventResultResponse
import io.github.bbsk.c5d.service.EventService
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
    name = "События смены (Events & Replanning)",
    description = "Регистрация внешних событий в течение смены и автоматическое реактивное перепланирование без поллинга"
)
@RestController
@RequestMapping("/api/v1/days/{date}/events")
class EventController(
    private val eventService: EventService
) {

    @Operation(
        summary = "Зарегистрировать событие смены",
        description = "Принимает внешнее событие (отмена наряда, новый наряд, сход инженера), фиксирует завершенные остановки до момента now (frozen_stops), немедленно вызывает перепланирование и возвращает обновленный план смены."
    )
    @ApiResponses(
        value = [
            ApiResponse(
                responseCode = "200",
                description = "Событие обработано, план успешно актуализирован",
                content = [Content(schema = Schema(implementation = EventResultResponse::class))]
            ),
            ApiResponse(
                responseCode = "400",
                description = "Ошибки валидации параметров события",
                content = [Content(schema = Schema(implementation = ErrorResponse::class))]
            ),
            ApiResponse(
                responseCode = "404",
                description = "Рабочий день, наряд или сотрудник не найден",
                content = [Content(schema = Schema(implementation = ErrorResponse::class))]
            )
        ]
    )
    @PostMapping
    fun processEvent(
        @Parameter(description = "Календарная дата дня (YYYY-MM-DD)", example = "2026-10-26")
        @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) date: LocalDate,

        @Valid @RequestBody request: EventInputDto
    ): ResponseEntity<EventResultResponse> {
        val result = eventService.processEvent(date, request)
        return ResponseEntity.ok(result)
    }
}
