package com.chemlab.repository;

import com.chemlab.entity.StudySession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface StudySessionRepository extends JpaRepository<StudySession, Long> {

    List<StudySession> findByUserIdOrderByStartedAtDesc(Long userId);

    @Query("SELECT COALESCE(SUM(s.durationMinutes), 0) FROM StudySession s WHERE s.user.id = :userId")
    int getTotalStudyMinutes(@Param("userId") Long userId);

    @Query("SELECT COALESCE(SUM(s.durationMinutes), 0) FROM StudySession s WHERE s.user.id = :userId AND s.startedAt >= :since")
    int getStudyMinutesSince(@Param("userId") Long userId, @Param("since") LocalDateTime since);

    @Query("SELECT s FROM StudySession s WHERE s.user.id = :userId AND s.startedAt >= :since ORDER BY s.startedAt ASC")
    List<StudySession> findByUserIdAndStartedAtAfter(@Param("userId") Long userId, @Param("since") LocalDateTime since);
}
