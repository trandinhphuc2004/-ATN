package com.chemlab.repository;

import com.chemlab.entity.Exam;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface ExamRepository extends JpaRepository<Exam, Long> {
    List<Exam> findByCreatedByIdOrderByCreatedAtDesc(Long teacherId);
    List<Exam> findByActiveTrueOrderByCreatedAtDesc();

    /** De thi dang mo da duoc quan tri vien gan vao lop. */
    @Query("SELECT e FROM ClassRoom c JOIN c.exams e WHERE c.id = :classId AND e.active = true ORDER BY e.createdAt DESC")
    List<Exam> findActiveByClassId(@Param("classId") Long classId);
}
