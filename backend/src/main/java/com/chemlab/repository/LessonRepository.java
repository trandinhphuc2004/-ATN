package com.chemlab.repository;

import com.chemlab.entity.Lesson;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface LessonRepository extends JpaRepository<Lesson, Long> {
    List<Lesson> findByTopic(String topic);
    List<Lesson> findByDifficulty(String difficulty);
    List<Lesson> findByTitleContainingIgnoreCase(String title);

    /** Bai hoc da duoc quan tri vien gan vao lop. */
    @Query("SELECT l FROM ClassRoom c JOIN c.lessons l WHERE c.id = :classId ORDER BY l.id")
    List<Lesson> findByClassId(@Param("classId") Long classId);
}
