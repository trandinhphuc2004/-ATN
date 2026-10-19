package com.chemlab.controller;

import com.chemlab.dto.AiLessonRequest;
import com.chemlab.dto.AiLessonResponse;
import com.chemlab.service.AiLessonGeneratorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * Sinh bai hoc bang AI. Ket qua tra ve de nguoi dung XEM TRUOC,
 * chua luu vao co so du lieu. Muon luu thi frontend goi POST /api/lessons.
 *
 * Quyen truy cap: chi ADMIN va TEACHER, dat trong SecurityConfig
 * cho khop voi quyen tao bai hoc thong thuong.
 */
@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiLessonController {

    private static final Logger log = LoggerFactory.getLogger(AiLessonController.class);

    private final AiLessonGeneratorService aiLessonGeneratorService;

    @PostMapping("/generate-lesson")
    public ResponseEntity<?> generateLesson(@Valid @RequestBody AiLessonRequest request) {
        try {
            AiLessonResponse lesson = aiLessonGeneratorService.generateLesson(request);
            return ResponseEntity.ok(lesson);
        } catch (Exception e) {
            // Log day du de debug, tra ve client thong bao gon khong lo stack trace.
            log.error("Sinh bai hoc that bai voi tieu de='{}'", request.getTitle(), e);
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(Map.of("message",
                            "Khong sinh duoc bai hoc luc nay. Vui long thu lai sau it phut."));
        }
    }
}
