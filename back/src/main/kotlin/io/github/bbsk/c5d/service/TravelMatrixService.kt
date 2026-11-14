package io.github.bbsk.c5d.service

import com.fasterxml.jackson.databind.ObjectMapper
import io.github.bbsk.c5d.exception.BadRequestException
import io.github.bbsk.c5d.model.reference.dto.bulk.TravelMatrixRequest
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import java.io.BufferedOutputStream
import java.io.File
import java.io.FileOutputStream
import java.util.concurrent.atomic.AtomicInteger
import java.util.concurrent.atomic.AtomicReference

@Service
class TravelMatrixService(
    @Autowired(required = false)
    private val objectMapper: ObjectMapper = ObjectMapper(),

    @Value("\${app.travel-matrix.file-path:travel_matrix.json}")
    private val matrixFilePath: String = "travel_matrix.json"
) {

    private val log = LoggerFactory.getLogger(TravelMatrixService::class.java)

    private val currentMatrixId = AtomicReference<String?>(null)
    private val cachedPointsCount = AtomicInteger(0)

    fun save(request: TravelMatrixRequest): Int {
        val n = request.points.size
        if (request.durationsSec.size != n) {
            throw BadRequestException(
                "INVALID_MATRIX_DIMENSIONS",
                "Размерность durations_sec (${request.durationsSec.size}) не совпадает с количеством точек points ($n)"
            )
        }
        if (request.distancesM.size != n) {
            throw BadRequestException(
                "INVALID_MATRIX_DIMENSIONS",
                "Размерность distances_m (${request.distancesM.size}) не совпадает с количеством точек points ($n)"
            )
        }

        // Сохранение в .json файл в корень проекта для модуля карты и Python-планировщика
        val targetFile = resolveProjectRootFile()
        try {
            targetFile.parentFile?.mkdirs()
            BufferedOutputStream(FileOutputStream(targetFile)).use { outputStream ->
                objectMapper.writeValue(outputStream, request)
            }
            log.info(
                "Матрица перемещений '{}' (точек: {}) успешно записана в JSON-файл: {}",
                request.matrixId,
                n,
                targetFile.canonicalPath
            )
        } catch (e: Exception) {
            log.error("Ошибка при сохранении матрицы в файл ${targetFile.canonicalPath}: ${e.message}", e)
            throw e
        }

        currentMatrixId.set(request.matrixId)
        cachedPointsCount.set(n)

        return n
    }

    fun isLoaded(): Boolean = currentMatrixId.get() != null || resolveProjectRootFile().exists()

    fun getMatrixId(): String? = currentMatrixId.get()

    fun getPointsCount(): Int = cachedPointsCount.get()

    fun getMatrixFile(): File = resolveProjectRootFile()

    private fun resolveProjectRootFile(): File {
        val candidate = File(matrixFilePath)
        if (candidate.isAbsolute) {
            return candidate
        }
        val currentDir = File(".").canonicalFile
        // Если запускаемся из подпапки back (например в Gradle bootRun или IDE)
        val rootDir = if (currentDir.name == "back" && (File(currentDir.parentFile, "docker-compose.yml").exists() || File(currentDir.parentFile, "back").exists())) {
            currentDir.parentFile
        } else {
            currentDir
        }
        return File(rootDir, matrixFilePath)
    }
}
