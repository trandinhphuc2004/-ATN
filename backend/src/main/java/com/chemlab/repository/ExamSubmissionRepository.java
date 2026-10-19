package com.chemlab.repository;

import com.chemlab.entity.ExamSubmission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface ExamSubmissionRepository extends JpaRepository<ExamSubmission, Long> {
    List<ExamSubmission> findByStudentIdOrderBySubmittedAtDesc(Long studentId);
    List<ExamSubmission> findByExamIdOrderBySubmittedAtDesc(Long examId);
    Optional<ExamSubmission> findByExamIdAndStudentId(Long examId, Long studentId);
    int countByExamId(Long examId);

    @Query("SELECT AVG(s.score * 100.0 / s.totalQuestions) FROM ExamSubmission s WHERE s.exam.id = :examId")
    Double getAverageScoreByExamId(@Param("examId") Long examId);

    @Query("SELECT MAX(s.score * 100.0 / s.totalQuestions) FROM ExamSubmission s WHERE s.exam.id = :examId")
    Double getHighestScoreByExamId(@Param("examId") Long examId);

    @Query("SELECT MIN(s.score * 100.0 / s.totalQuestions) FROM ExamSubmission s WHERE s.exam.id = :examId")
    Double getLowestScoreByExamId(@Param("examId") Long examId);

    @Query("SELECT AVG(s.score * 100.0 / s.totalQuestions) FROM ExamSubmission s WHERE s.student.id = :studentId")
    Double getAverageScoreByStudentId(@Param("studentId") Long studentId);

    int countByStudentId(Long studentId);
}
