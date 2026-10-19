package com.chemlab.service;

import com.chemlab.dto.TeacherDashboardDto;
import com.chemlab.entity.*;
import com.chemlab.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Bang theo doi cua giao vien theo tung lop. Chi tinh diem / tien do cua hoc sinh thuoc lop
 * tren cac bai hoc, bai kiem tra da gan cho lop, va chi giao vien cua lop moi xem duoc.
 */
@Service
public class TeacherDashboardService {

    private final UserRepository userRepository;
    private final ClassRoomRepository classRoomRepository;
    private final ExamSubmissionRepository submissionRepository;
    private final LessonProgressRepository lessonProgressRepository;
    private final StudySessionRepository studySessionRepository;
    private final ClassAccessService classAccessService;

    public TeacherDashboardService(UserRepository userRepository,
                                    ClassRoomRepository classRoomRepository,
                                    ExamSubmissionRepository submissionRepository,
                                    LessonProgressRepository lessonProgressRepository,
                                    StudySessionRepository studySessionRepository,
                                    ClassAccessService classAccessService) {
        this.userRepository = userRepository;
        this.classRoomRepository = classRoomRepository;
        this.submissionRepository = submissionRepository;
        this.lessonProgressRepository = lessonProgressRepository;
        this.studySessionRepository = studySessionRepository;
        this.classAccessService = classAccessService;
    }

    @Transactional(readOnly = true)
    public TeacherDashboardDto getClassDashboard(String viewerEmail, Long classId) {
        User viewer = classAccessService.requireUser(viewerEmail);
        classAccessService.checkCanViewClass(viewer, classId);
        ClassRoom classRoom = classRoomRepository.findById(classId)
                .orElseThrow(() -> new RuntimeException("Class not found"));

        List<User> students = userRepository.findByClassRoom_IdOrderByNameAsc(classId);
        Set<Long> studentIds = students.stream().map(User::getId).collect(Collectors.toSet());

        List<Exam> exams = new ArrayList<>(classRoom.getExams());
        exams.sort(Comparator.comparing(Exam::getCreatedAt,
                Comparator.nullsLast(Comparator.<LocalDateTime>reverseOrder())));
        List<Lesson> lessons = new ArrayList<>(classRoom.getLessons());
        lessons.sort(Comparator.comparing(Lesson::getId));
        Set<Long> lessonIds = lessons.stream().map(Lesson::getId).collect(Collectors.toSet());

        // Exam summaries: chi tinh bai nop cua hoc sinh trong lop
        List<TeacherDashboardDto.ExamSummary> examSummaries = new ArrayList<>();
        Map<Long, List<Double>> scoresByStudent = new HashMap<>();
        int totalSubmissions = 0;
        double totalAvg = 0;
        int examWithSubmissions = 0;

        for (Exam exam : exams) {
            List<Double> percents = new ArrayList<>();
            for (ExamSubmission s : submissionRepository.findByExamIdOrderBySubmittedAtDesc(exam.getId())) {
                Long studentId = s.getStudent().getId();
                if (!studentIds.contains(studentId)) continue;
                double percent = s.getTotalQuestions() == 0 ? 0 : s.getScore() * 100.0 / s.getTotalQuestions();
                percents.add(percent);
                scoresByStudent.computeIfAbsent(studentId, k -> new ArrayList<>()).add(percent);
            }
            totalSubmissions += percents.size();

            DoubleSummaryStatistics stats = percents.stream().mapToDouble(Double::doubleValue).summaryStatistics();
            if (!percents.isEmpty()) {
                totalAvg += stats.getAverage();
                examWithSubmissions++;
            }

            examSummaries.add(TeacherDashboardDto.ExamSummary.builder()
                    .examId(exam.getId())
                    .examTitle(exam.getTitle())
                    .submissions(percents.size())
                    .averageScore(percents.isEmpty() ? 0 : stats.getAverage())
                    .highestScore(percents.isEmpty() ? 0 : stats.getMax())
                    .lowestScore(percents.isEmpty() ? 0 : stats.getMin())
                    .build());
        }

        // Lesson summaries: so hoc sinh cua lop da hoan thanh tung bai hoc
        List<TeacherDashboardDto.LessonSummary> lessonSummaries = lessons.stream()
                .map(l -> TeacherDashboardDto.LessonSummary.builder()
                        .lessonId(l.getId())
                        .lessonTitle(l.getTitle())
                        .completedCount(lessonProgressRepository
                                .countByLessonIdAndUser_ClassRoom_IdAndCompletedTrue(l.getId(), classId))
                        .totalStudents(students.size())
                        .build())
                .collect(Collectors.toList());

        // Student progress
        List<TeacherDashboardDto.StudentProgress> studentProgressList = new ArrayList<>();
        for (User student : students) {
            List<Double> scores = scoresByStudent.getOrDefault(student.getId(), List.of());
            int lessonsCompleted = (int) lessonProgressRepository.findByUserIdAndCompletedTrue(student.getId())
                    .stream().filter(p -> lessonIds.contains(p.getLesson().getId())).count();
            int studyMinutes = studySessionRepository.getTotalStudyMinutes(student.getId());

            studentProgressList.add(TeacherDashboardDto.StudentProgress.builder()
                    .studentId(student.getId())
                    .studentName(student.getName())
                    .studentEmail(student.getEmail())
                    .examsCompleted(scores.size())
                    .averageScore(scores.stream().mapToDouble(Double::doubleValue).average().orElse(0))
                    .lessonsCompleted(lessonsCompleted)
                    .totalStudyMinutes(studyMinutes)
                    .build());
        }

        double classAvg = examWithSubmissions > 0 ? totalAvg / examWithSubmissions : 0;

        return TeacherDashboardDto.builder()
                .classId(classRoom.getId())
                .className(classRoom.getName())
                .totalStudents(students.size())
                .totalExams(exams.size())
                .totalLessons(lessons.size())
                .classAverageScore(classAvg)
                .totalSubmissions(totalSubmissions)
                .examSummaries(examSummaries)
                .lessonSummaries(lessonSummaries)
                .studentProgressList(studentProgressList)
                .build();
    }
}
