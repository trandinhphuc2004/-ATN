package com.chemlab.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuizResultDto {
    private int score;
    private int totalQuestions;
    private double percentage;
    private List<QuestionResult> details;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class QuestionResult {
        private Long questionId;
        private String question;
        private String selectedAnswer;
        private String correctAnswer;
        private boolean correct;
    }
}
