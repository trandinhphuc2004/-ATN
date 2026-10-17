package com.chemlab.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.LinkedHashSet;
import java.util.Set;

/**
 * Lop hoc do quan tri vien tao. Quan tri vien gan giao vien, bai hoc va bai kiem tra
 * vao lop; hoc sinh thuoc lop qua cot users.class_id (moi hoc sinh chi thuoc 1 lop).
 * Chi giao vien duoc phan cong vao lop (va quan tri vien) moi xem duoc du lieu cua lop.
 */
@Entity
@Table(name = "classrooms")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class ClassRoom {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name; // VD: 10A1

    @Column(name = "grade_level")
    private Integer gradeLevel; // Khoi lop: 8 - 12

    @Column(name = "school_year")
    private String schoolYear; // VD: 2026-2027

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "class_teachers",
        joinColumns = @JoinColumn(name = "class_id"),
        inverseJoinColumns = @JoinColumn(name = "teacher_id")
    )
    @Builder.Default
    private Set<User> teachers = new LinkedHashSet<>();

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "class_lessons",
        joinColumns = @JoinColumn(name = "class_id"),
        inverseJoinColumns = @JoinColumn(name = "lesson_id")
    )
    @Builder.Default
    private Set<Lesson> lessons = new LinkedHashSet<>();

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "class_exams",
        joinColumns = @JoinColumn(name = "class_id"),
        inverseJoinColumns = @JoinColumn(name = "exam_id")
    )
    @Builder.Default
    private Set<Exam> exams = new LinkedHashSet<>();

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
