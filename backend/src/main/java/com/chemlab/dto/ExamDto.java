package com.chemlab.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data @Builder
@NoArgsConstructor @AllArgsConstructor
public class ExamDto {
    private Long id;
    private String title;
    private String description;
    private int timeLimitMinutes;
    private boolean randomOrder;
    private String topic;
    private String difficulty;
    private boolean active;
    private String createdAt;
    private String createdByName;
    private int questionCount;
    private List<QuestionDto> questions; // only for teacher or after submission

    @Data @Builder
    @NoArgsConstructor @AllArgsConstructor
    public static class QuestionDto {
        private Long id;
        private String question;
        private String optionA;
        private String optionB;
        private String optionC;
        private String optionD;
        private String topic;
        private String difficulty;
        // correctAnswer intentionally excluded for student view
    }
}
