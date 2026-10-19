package com.chemlab.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DashboardDto {
    private int lessonsCompleted;
    private int totalLessons;
    private double averageScore;
    private int totalQuizzesTaken;
    private int totalStudyMinutes;
    private List<WeeklyStudy> weeklyStudyTime;
    private List<ScoreHistory> scoreHistory;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class WeeklyStudy {
        private String day; // MON, TUE, etc.
        private int minutes;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ScoreHistory {
        private String date;
        private String topic;
        private double percentage;
    }
}
