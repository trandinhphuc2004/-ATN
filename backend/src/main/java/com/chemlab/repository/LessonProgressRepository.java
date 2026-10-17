package com.chemlab.repository;

import com.chemlab.entity.LessonProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface LessonProgressRepository extends JpaRepository<LessonProgress, Long> {

    List<LessonProgress> findByUserIdAndCompletedTrue(Long userId);

    Optional<LessonProgress> findByUserIdAndLessonId(Long userId, Long lessonId);

    int countByUserIdAndCompletedTrue(Long userId);

    /** So hoc sinh cua lop da hoan thanh mot bai hoc. */
    int countByLessonIdAndUser_ClassRoom_IdAndCompletedTrue(Long lessonId, Long classId);

    /** Xoa tien do hoc cua mot bai hoc; dung truoc khi xoa bai hoc do. */
    void deleteByLessonId(Long lessonId);
}
