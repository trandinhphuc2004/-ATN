package com.chemlab.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RecommendationDto {
    private List<WeakTopic> weakTopics;
    private List<Suggestion> suggestions;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class WeakTopic {
        private String topic;
        private double averageScore;
        private int quizzesTaken;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Suggestion {
        private String type; // LESSON, QUIZ, REVIEW
        private String title;         // Van giu de tuong thich nguoc (tieng Anh)
        private String description;   // Van giu de tuong thich nguoc (tieng Anh)
        private Long referenceId;
        /** Khoa i18n de frontend dich sang ngon ngu dang chon. */
        private String titleKey;
        private String descriptionKey;
        /** Tham so noi suy cho khoa i18n (vd: {lesson}, {topic}, {score}). */
        private Map<String, Object> params;

        public Suggestion(String type, String title, String description, Long referenceId) {
            this(type, title, description, referenceId, null, null, null);
        }
    }
}
