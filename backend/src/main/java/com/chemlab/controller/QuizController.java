package com.chemlab.controller;

import com.chemlab.dto.CreateQuestionRequest;
import com.chemlab.dto.QuizResultDto;
import com.chemlab.dto.QuizSubmission;
import com.chemlab.entity.Question;
import com.chemlab.entity.QuizResult;
import com.chemlab.service.QuizService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/quiz")
public class QuizController {

    private final QuizService quizService;

    public QuizController(QuizService quizService) {
        this.quizService = quizService;
    }

    @GetMapping("/questions")
    public ResponseEntity<List<Question>> getQuestions(@RequestParam(required = false) String topic) {
        return ResponseEntity.ok(quizService.getQuestionsByTopic(topic));
    }

    @PostMapping("/questions")
    public ResponseEntity<Question> createQuestion(@Valid @RequestBody CreateQuestionRequest request) {
        return ResponseEntity.ok(quizService.createQuestion(request));
    }

    @DeleteMapping("/questions/{id}")
    public ResponseEntity<Map<String, String>> deleteQuestion(@PathVariable Long id) {
        quizService.deleteQuestion(id);
        return ResponseEntity.ok(Map.of("message", "Question deleted successfully"));
    }

    @PostMapping("/submit")
    public ResponseEntity<QuizResultDto> submitQuiz(
            @Valid @RequestBody QuizSubmission submission,
            Authentication authentication) {
        return ResponseEntity.ok(quizService.submitQuiz(submission, authentication.getName()));
    }

    @GetMapping("/results")
    public ResponseEntity<List<QuizResult>> getResults(Authentication authentication) {
        return ResponseEntity.ok(quizService.getUserResults(authentication.getName()));
    }
}
