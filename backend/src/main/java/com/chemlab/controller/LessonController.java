package com.chemlab.controller;

import com.chemlab.dto.CreateLessonRequest;
import com.chemlab.entity.Lesson;
import com.chemlab.service.LessonService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/lessons")
public class LessonController {

    private final LessonService lessonService;

    public LessonController(LessonService lessonService) {
        this.lessonService = lessonService;
    }

    // Hoc sinh chi nhan bai hoc da gan cho lop cua minh (xem LessonService.getVisibleLessons)
    @GetMapping
    public ResponseEntity<List<Lesson>> getAllLessons(@RequestParam(required = false) String title,
                                                      Authentication authentication) {
        if (title != null && !title.isEmpty()) {
            return ResponseEntity.ok(lessonService.searchLessonsByTitle(authentication.getName(), title));
        }
        return ResponseEntity.ok(lessonService.getAllLessons(authentication.getName()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Lesson> getLessonById(@PathVariable Long id, Authentication authentication) {
        return ResponseEntity.ok(lessonService.getLessonById(authentication.getName(), id));
    }

    @GetMapping("/topic/{topic}")
    public ResponseEntity<List<Lesson>> getLessonsByTopic(@PathVariable String topic,
                                                          Authentication authentication) {
        return ResponseEntity.ok(lessonService.getLessonsByTopic(authentication.getName(), topic));
    }

    @GetMapping("/difficulty/{difficulty}")
    public ResponseEntity<List<Lesson>> getLessonsByDifficulty(@PathVariable String difficulty,
                                                               Authentication authentication) {
        return ResponseEntity.ok(lessonService.getLessonsByDifficulty(authentication.getName(), difficulty));
    }

    @PostMapping
    public ResponseEntity<Lesson> createLesson(@Valid @RequestBody CreateLessonRequest request) {
        return ResponseEntity.ok(lessonService.createLesson(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Lesson> updateLesson(@PathVariable Long id,
                                               @RequestBody CreateLessonRequest request) {
        return ResponseEntity.ok(lessonService.updateLesson(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteLesson(@PathVariable Long id) {
        lessonService.deleteLesson(id);
        return ResponseEntity.ok(Map.of("message", "Lesson deleted successfully"));
    }
}
