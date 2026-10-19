package com.chemlab.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

/** Thong ke cua MOT lop; chi giao vien duoc phan cong vao lop (hoac quan tri vien) xem duoc. */
@Data @Builder
@NoArgsConstructor @AllArgsConstructor
public class TeacherDashboardDto {
    private Long classId;
    private String className;
    private int totalStudents;
    private int totalExams;
    private int totalLessons;
    private double classAverageScore;
    private int totalSubmissions;
    private List<ExamSummary> examSummaries;
    private List<LessonSummary> lessonSummaries;
    private List<StudentProgress> studentProgressList;

    @Data @Builder
    @NoArgsConstructor @AllArgsConstructor
    public static class ExamSummary {
        private Long examId;
        private String examTitle;
        private int submissions;
        private double averageScore;
        private double highestScore;
        private double lowestScore;
    }

    @Data @Builder
    @NoArgsConstructor @AllArgsConstructor
    public static class LessonSummary {
        private Long lessonId;
        private String lessonTitle;
        private int completedCount;
        private int totalStudents;
    }

    @Data @Builder
    @NoArgsConstructor @AllArgsConstructor
    public static class StudentProgress {
        private Long studentId;
        private String studentName;
        private String studentEmail;
        private int examsCompleted;
        private double averageScore;
        private int lessonsCompleted;
        private int totalStudyMinutes;
    }
}
