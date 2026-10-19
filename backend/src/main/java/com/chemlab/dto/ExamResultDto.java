package com.chemlab.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data @Builder
@NoArgsConstructor @AllArgsConstructor
public class ExamResultDto {
    private Long examId;
    private String examTitle;
    private int score;
    private int totalQuestions;
    private double percentage;
    private List<ExamQuestionResult> details;

    @Data @Builder
    @NoArgsConstructor @AllArgsConstructor
    public static class ExamQuestionResult {
        private Long questionId;
        private String question;
        private String selectedAnswer;
        private String correctAnswer;
        private boolean correct;

        // Noi dung 4 dap an va loi giai, de man hinh chua de hien duoc dap an bang chu
        // chu khong chi hien mot ky tu A/B/C/D.
        private String optionA;
        private String optionB;
        private String optionC;
        private String optionD;
        private String explanation;
    }
}
