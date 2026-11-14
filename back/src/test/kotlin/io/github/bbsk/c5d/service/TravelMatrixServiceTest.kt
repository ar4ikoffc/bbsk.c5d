package io.github.bbsk.c5d.service

import com.fasterxml.jackson.databind.ObjectMapper
import io.github.bbsk.c5d.exception.BadRequestException
import io.github.bbsk.c5d.model.reference.dto.bulk.TravelMatrixRequest
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test

class TravelMatrixServiceTest {

    private lateinit var travelMatrixService: TravelMatrixService
    private val testFileName = "test_travel_matrix.json"

    @BeforeEach
    fun setUp() {
        travelMatrixService = TravelMatrixService(
            objectMapper = ObjectMapper(),
            matrixFilePath = testFileName
        )
    }

    @AfterEach
    fun tearDown() {
        val file = travelMatrixService.getMatrixFile()
        if (file.exists()) {
            file.delete()
        }
    }

    @Test
    fun `save travel matrix successfully writes JSON file and updates metadata`() {
        val request = TravelMatrixRequest(
            matrixId = "ekb-2026-10-v1",
            points = listOf("SC-01", "B-00001", "B-00002"),
            durationsSec = listOf(
                listOf(0, 300, 600),
                listOf(350, 0, 200),
                listOf(620, 210, 0)
            ),
            distancesM = listOf(
                listOf(0, 2500, 5000),
                listOf(2600, 0, 1500),
                listOf(5100, 1600, 0)
            )
        )

        val count = travelMatrixService.save(request)

        assertEquals(3, count)
        assertTrue(travelMatrixService.isLoaded())
        assertEquals("ekb-2026-10-v1", travelMatrixService.getMatrixId())
        assertEquals(3, travelMatrixService.getPointsCount())

        // Проверяем, что файл действительно записан на диск
        val savedFile = travelMatrixService.getMatrixFile()
        assertTrue(savedFile.exists(), "Файл матрицы перемещений должен быть сохранен на диск")
        assertTrue(savedFile.length() > 0, "Файл матрицы перемещений не должен быть пустым")
    }

    @Test
    fun `save throws BadRequestException when dimensions do not match`() {
        val request = TravelMatrixRequest(
            matrixId = "ekb-2026-10-v1",
            points = listOf("SC-01", "B-00001"),
            durationsSec = listOf(
                listOf(0, 300)
                // missing row
            ),
            distancesM = listOf(
                listOf(0, 2500),
                listOf(2600, 0)
            )
        )

        val ex = assertThrows(BadRequestException::class.java) {
            travelMatrixService.save(request)
        }
        assertEquals("INVALID_MATRIX_DIMENSIONS", ex.code)
    }
}
