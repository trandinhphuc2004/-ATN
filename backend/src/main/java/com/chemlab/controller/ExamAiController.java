package com.chemlab.controller;

import com.chemlab.service.ExamAiService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import java.util.Map;

@RestController
@RequestMapping("/api/exam-ai")
@RequiredArgsConstructor
public class ExamAiController {

    private final ExamAiService examAiService;

    @PreAuthorize("hasAnyRole('ADMIN','TEACHER')")
    @PostMapping("/analyze")
    public ResponseEntity<Map<String, String>> analyzeExam(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "File is empty"));
        }
        
        String analysisResult = examAiService.analyzeExam(file);
        
        return ResponseEntity.ok(Map.of("result", analysisResult));
    }
}
