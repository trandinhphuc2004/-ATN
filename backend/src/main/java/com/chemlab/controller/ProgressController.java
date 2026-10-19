package com.chemlab.controller;

import com.chemlab.dto.DashboardDto;
import com.chemlab.dto.StudySessionRequest;
import com.chemlab.service.ProgressService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/progress")
public class ProgressController {

    private final ProgressService progressService;

    public ProgressController(ProgressService progressService) {
        this.progressService = progressService;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardDto> getDashboard(Authentication authentication) {
        return ResponseEntity.ok(progressService.getDashboard(authentication.getName()));
    }

    @PostMapping("/lessons/{lessonId}/complete")
    public ResponseEntity<Void> markLessonCompleted(
            @PathVariable Long lessonId,
            Authentication authentication) {
        progressService.markLessonCompleted(authentication.getName(), lessonId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/study-session")
    public ResponseEntity<Void> recordStudySession(
            @RequestBody StudySessionRequest request,
            Authentication authentication) {
        progressService.recordStudySession(authentication.getName(), request);
        return ResponseEntity.ok().build();
    }
}
