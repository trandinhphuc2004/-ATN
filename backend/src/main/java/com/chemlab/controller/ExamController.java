package com.chemlab.controller;

import com.chemlab.dto.*;
import com.chemlab.service.ExamService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/exams")
public class ExamController {

    private final ExamService examService;

    public ExamController(ExamService examService) {
        this.examService = examService;
    }

    // Teacher: create exam
    @PostMapping
    public ResponseEntity<ExamDto> createExam(
            @Valid @RequestBody CreateExamRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(examService.createExam(authentication.getName(), request));
    }

    // Teacher: get my exams
    @GetMapping("/my")
    public ResponseEntity<List<ExamDto>> getMyExams(Authentication authentication) {
        return ResponseEntity.ok(examService.getTeacherExams(authentication.getName()));
    }

    // Admin: toan bo de thi (ke ca de dang dong) de gan vao lop
    @GetMapping("/all")
    public ResponseEntity<List<ExamDto>> getAllExams() {
        return ResponseEntity.ok(examService.getAllExams());
    }

    // Student: list active exams assigned to the student's class
    @GetMapping("/active")
    public ResponseEntity<List<ExamDto>> getActiveExams(Authentication authentication) {
        return ResponseEntity.ok(examService.getActiveExams(authentication.getName()));
    }

    // Student: get exam to take (questions without answers)
    @GetMapping("/{examId}/take")
    public ResponseEntity<ExamDto> getExamForTaking(@PathVariable Long examId,
                                                    Authentication authentication) {
        return ResponseEntity.ok(examService.getExamForStudent(authentication.getName(), examId));
    }

    // Student: submit exam
    @PostMapping("/submit")
    public ResponseEntity<ExamResultDto> submitExam(
            @RequestBody ExamSubmissionRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(examService.submitExam(authentication.getName(), request));
    }

    // Student: xem lai bai thi da nop (chua bai)
    @GetMapping("/{examId}/review")
    public ResponseEntity<ExamResultDto> reviewSubmission(
            @PathVariable Long examId,
            Authentication authentication) {
        return ResponseEntity.ok(
                examService.getSubmissionReview(authentication.getName(), examId));
    }

    // Teacher: toggle active/inactive
    @PutMapping("/{examId}/toggle")
    public ResponseEntity<Void> toggleExam(
            @PathVariable Long examId,
            Authentication authentication) {
        examService.toggleExamActive(authentication.getName(), examId);
        return ResponseEntity.ok().build();
    }

    // Teacher: delete exam
    @DeleteMapping("/{examId}")
    public ResponseEntity<Void> deleteExam(
            @PathVariable Long examId,
            Authentication authentication) {
        examService.deleteExam(authentication.getName(), examId);
        return ResponseEntity.ok().build();
    }
}
