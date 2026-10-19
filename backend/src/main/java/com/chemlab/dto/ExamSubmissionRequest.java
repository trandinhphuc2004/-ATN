package com.chemlab.dto;

import lombok.Data;
import java.util.List;

@Data
public class ExamSubmissionRequest {
    private Long examId;
    private List<ExamAnswerItem> answers;
    private String startedAt; // ISO datetime

    @Data
    public static class ExamAnswerItem {
        private Long questionId;
        private String selectedAnswer;
    }
}
