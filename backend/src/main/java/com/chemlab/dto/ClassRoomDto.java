package com.chemlab.dto;

import com.chemlab.entity.ClassRoom;
import com.chemlab.entity.Exam;
import com.chemlab.entity.Lesson;
import com.chemlab.entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data @Builder
@NoArgsConstructor @AllArgsConstructor
public class ClassRoomDto {
    private Long id;
    private String name;
    private Integer gradeLevel;
    private String schoolYear;
    private String description;
    private LocalDateTime createdAt;
    private int studentCount;
    private int lessonCount;
    private int examCount;
    private List<String> teacherNames;

    // Chi co khi xem chi tiet lop
    private List<Member> students;
    private List<Member> teachers;
    private List<LessonItem> lessons;
    private List<ExamItem> exams;

    @Data @Builder
    @NoArgsConstructor @AllArgsConstructor
    public static class Member {
        private Long id;
        private String name;
        private String email;

        public static Member of(User u) {
            return new Member(u.getId(), u.getName(), u.getEmail());
        }
    }

    @Data @Builder
    @NoArgsConstructor @AllArgsConstructor
    public static class LessonItem {
        private Long id;
        private String title;
        private String topic;
        private String difficulty;

        public static LessonItem of(Lesson l) {
            return new LessonItem(l.getId(), l.getTitle(), l.getTopic(), l.getDifficulty());
        }
    }

    @Data @Builder
    @NoArgsConstructor @AllArgsConstructor
    public static class ExamItem {
        private Long id;
        private String title;
        private int questionCount;
        private boolean active;
        private String createdByName;

        public static ExamItem of(Exam e) {
            return new ExamItem(e.getId(), e.getTitle(), e.getQuestions().size(), e.isActive(),
                    e.getCreatedBy().getName());
        }
    }

    public static ClassRoomDto summaryOf(ClassRoom c, int studentCount) {
        return ClassRoomDto.builder()
                .id(c.getId())
                .name(c.getName())
                .gradeLevel(c.getGradeLevel())
                .schoolYear(c.getSchoolYear())
                .description(c.getDescription())
                .createdAt(c.getCreatedAt())
                .studentCount(studentCount)
                .lessonCount(c.getLessons().size())
                .examCount(c.getExams().size())
                .teacherNames(c.getTeachers().stream().map(User::getName).sorted().toList())
                .build();
    }
}
