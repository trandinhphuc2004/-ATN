package com.chemlab.service;

import com.chemlab.dto.DashboardDto;
import com.chemlab.dto.StudySessionRequest;
import com.chemlab.entity.*;
import com.chemlab.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ProgressService {

    private final QuizResultRepository quizResultRepository;
    private final LessonProgressRepository lessonProgressRepository;
    private final LessonRepository lessonRepository;
    private final StudySessionRepository studySessionRepository;
    private final UserRepository userRepository;
    private final LessonService lessonService;
    private final ClassAccessService classAccessService;

    public ProgressService(QuizResultRepository quizResultRepository,
                           LessonProgressRepository lessonProgressRepository,
                           LessonRepository lessonRepository,
                           StudySessionRepository studySessionRepository,
                           UserRepository userRepository,
                           LessonService lessonService,
                           ClassAccessService classAccessService) {
        this.quizResultRepository = quizResultRepository;
        this.lessonProgressRepository = lessonProgressRepository;
        this.lessonRepository = lessonRepository;
        this.studySessionRepository = studySessionRepository;
        this.userRepository = userRepository;
        this.lessonService = lessonService;
        this.classAccessService = classAccessService;
    }

    @Transactional(readOnly = true)
    public DashboardDto getDashboard(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Long userId = user.getId();

        // Lessons completed: chi tinh tren bai hoc nguoi dung duoc thay (hoc sinh: bai hoc cua lop)
        Set<Long> visibleLessonIds = lessonService.getVisibleLessons(user).stream()
                .map(Lesson::getId).collect(Collectors.toSet());
        int lessonsCompleted = (int) lessonProgressRepository.findByUserIdAndCompletedTrue(userId).stream()
                .filter(p -> visibleLessonIds.contains(p.getLesson().getId()))
                .count();
        int totalLessons = visibleLessonIds.size();

        // Quiz stats
        List<QuizResult> quizResults = quizResultRepository.findByUserIdOrderByCompletedAtDesc(userId);
        int totalQuizzes = quizResults.size();
        double avgScore = quizResults.stream()
                .mapToDouble(r -> (double) r.getScore() / r.getTotalQuestions() * 100)
                .average()
                .orElse(0);

        // Total study time
        int totalMinutes = studySessionRepository.getTotalStudyMinutes(userId);

        // Weekly study time (last 7 days)
        LocalDateTime weekAgo = LocalDate.now().minusDays(6).atStartOfDay();
        List<StudySession> recentSessions = studySessionRepository.findByUserIdAndStartedAtAfter(userId, weekAgo);

        Map<DayOfWeek, Integer> dayMap = new LinkedHashMap<>();
        for (int i = 6; i >= 0; i--) {
            dayMap.put(LocalDate.now().minusDays(i).getDayOfWeek(), 0);
        }
        for (StudySession s : recentSessions) {
            DayOfWeek dow = s.getStartedAt().getDayOfWeek();
            dayMap.merge(dow, s.getDurationMinutes(), Integer::sum);
        }
        List<DashboardDto.WeeklyStudy> weeklyStudy = dayMap.entrySet().stream()
                .map(e -> new DashboardDto.WeeklyStudy(
                        e.getKey().toString().substring(0, 3),
                        e.getValue()))
                .collect(Collectors.toList());

        // Score history (last 10 quizzes)
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("dd/MM");
        List<DashboardDto.ScoreHistory> scoreHistory = quizResults.stream()
                .limit(10)
                .map(r -> new DashboardDto.ScoreHistory(
                        r.getCompletedAt().format(fmt),
                        r.getTopic() != null ? r.getTopic() : "Mixed",
                        (double) r.getScore() / r.getTotalQuestions() * 100))
                .collect(Collectors.toList());
        Collections.reverse(scoreHistory);

        return new DashboardDto(
                lessonsCompleted, totalLessons, Math.round(avgScore * 10.0) / 10.0,
                totalQuizzes, totalMinutes, weeklyStudy, scoreHistory
        );
    }

    @Transactional
    public void markLessonCompleted(String userEmail, Long lessonId) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new RuntimeException("Lesson not found"));
        classAccessService.checkCanAccessLesson(user, lessonId);

        Optional<LessonProgress> existing = lessonProgressRepository
                .findByUserIdAndLessonId(user.getId(), lessonId);

        if (existing.isEmpty()) {
            LessonProgress progress = LessonProgress.builder()
                    .user(user)
                    .lesson(lesson)
                    .completed(true)
                    .completedAt(LocalDateTime.now())
                    .build();
            lessonProgressRepository.save(progress);
        } else if (!existing.get().isCompleted()) {
            LessonProgress p = existing.get();
            p.setCompleted(true);
            p.setCompletedAt(LocalDateTime.now());
            lessonProgressRepository.save(p);
        }
    }

    @Transactional
    public void recordStudySession(String userEmail, StudySessionRequest request) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        StudySession session = StudySession.builder()
                .user(user)
                .activityType(request.getActivityType())
                .referenceId(request.getReferenceId())
                .durationMinutes(request.getDurationMinutes())
                .startedAt(LocalDateTime.now().minusMinutes(request.getDurationMinutes()))
                .endedAt(LocalDateTime.now())
                .build();
        studySessionRepository.save(session);
    }
}
