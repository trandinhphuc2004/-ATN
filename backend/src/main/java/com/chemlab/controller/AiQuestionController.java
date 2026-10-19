package com.chemlab.controller;

import com.chemlab.dto.AiQuestionRequest;
import com.chemlab.entity.Question;
import com.chemlab.service.AiQuestionGeneratorService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ai")
public class AiQuestionController {

    private final AiQuestionGeneratorService generatorService;

    public AiQuestionController(AiQuestionGeneratorService generatorService) {
        this.generatorService = generatorService;
    }

    @PostMapping("/generate-questions")
    public ResponseEntity<List<Question>> generateQuestions(@Valid @RequestBody AiQuestionRequest request) {
        return ResponseEntity.ok(generatorService.generateQuestions(request));
    }
}
