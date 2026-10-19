package com.chemlab.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.util.List;

@Data
public class QuizSubmission {
    @NotNull
    private List<AnswerItem> answers;

    private String topic;

    @Data
    public static class AnswerItem {
        @NotNull
        private Long questionId;
        @NotNull
        private String selectedAnswer; // A, B, C, or D
    }
}
