package com.chemlab.service;

import com.chemlab.dto.RecommendationDto;
import com.chemlab.entity.*;
import com.chemlab.repository.*;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class RecommendationService {

    private final QuizResultRepository quizResultRepository;
    private final LessonProgressRepository lessonProgressRepository;
    private final QuestionRepository questionRepository;
    private final UserRepository userRepository;
    private final LessonService lessonService;

    public RecommendationService(QuizResultRepository quizResultRepository,
                                  LessonProgressRepository lessonProgressRepository,
                                  QuestionRepository questionRepository,
                                  UserRepository userRepository,
                                  LessonService lessonService) {
        this.quizResultRepository = quizResultRepository;
        this.lessonProgressRepository = lessonProgressRepository;
        this.questionRepository = questionRepository;
        this.userRepository = userRepository;
        this.lessonService = lessonService;
    }

    public RecommendationDto getRecommendations(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Long userId = user.getId();

        List<QuizResult> results = quizResultRepository.findByUserIdOrderByCompletedAtDesc(userId);

        // Analyze weak topics
        Map<String, List<QuizResult>> byTopic = results.stream()
                .filter(r -> r.getTopic() != null && !r.getTopic().isEmpty())
                .collect(Collectors.groupingBy(QuizResult::getTopic));

        List<RecommendationDto.WeakTopic> weakTopics = new ArrayList<>();
        for (Map.Entry<String, List<QuizResult>> entry : byTopic.entrySet()) {
            List<QuizResult> topicResults = entry.getValue();
            double avgScore = topicResults.stream()
                    .mapToDouble(r -> (double) r.getScore() / r.getTotalQuestions() * 100)
                    .average()
                    .orElse(0);
            weakTopics.add(new RecommendationDto.WeakTopic(
                    entry.getKey(), Math.round(avgScore * 10.0) / 10.0, topicResults.size()
            ));
        }
        // Sort by score ascending (weakest first)
        weakTopics.sort(Comparator.comparingDouble(RecommendationDto.WeakTopic::getAverageScore));

        // Generate suggestions
        List<RecommendationDto.Suggestion> suggestions = new ArrayList<>();

        // Find uncompleted lessons
        Set<Long> completedLessonIds = lessonProgressRepository
                .findByUserIdAndCompletedTrue(userId).stream()
                .map(lp -> lp.getLesson().getId())
                .collect(Collectors.toSet());

        // Hoc sinh chi duoc goi y bai hoc da gan cho lop cua minh
        List<Lesson> allLessons = lessonService.getVisibleLessons(user);
        List<Lesson> uncompletedLessons = allLessons.stream()
                .filter(l -> !completedLessonIds.contains(l.getId()))
                .collect(Collectors.toList());

        // Suggest lessons for weak topics first
        for (RecommendationDto.WeakTopic wt : weakTopics) {
            if (wt.getAverageScore() < 70) {
                // Find lessons matching this weak topic
                uncompletedLessons.stream()
                        .filter(l -> l.getTopic().equalsIgnoreCase(wt.getTopic()))
                        .findFirst()
                        .ifPresent(lesson -> suggestions.add(new RecommendationDto.Suggestion(
                                "LESSON",
                                "Study: " + lesson.getTitle(),
                                "Your average score in " + wt.getTopic() + " is " + wt.getAverageScore() + "%. Review this lesson to improve.",
                                lesson.getId(),
                                "RECOMMEND.SUG.STUDY_TITLE",
                                "RECOMMEND.SUG.STUDY_DESC",
                                Map.of("lesson", lesson.getTitle(),
                                       "topic", wt.getTopic(),
                                       "score", wt.getAverageScore())
                        )));

                // Suggest practice quiz for weak topic
                suggestions.add(new RecommendationDto.Suggestion(
                        "QUIZ",
                        "Practice Quiz: " + wt.getTopic(),
                        "Take more quizzes on " + wt.getTopic() + " to strengthen your understanding.",
                        null,
                        "RECOMMEND.SUG.PRACTICE_TITLE",
                        "RECOMMEND.SUG.PRACTICE_DESC",
                        Map.of("topic", wt.getTopic())
                ));
            }
        }

        // Suggest uncompleted lessons
        for (Lesson lesson : uncompletedLessons) {
            boolean alreadySuggested = suggestions.stream()
                    .anyMatch(s -> "LESSON".equals(s.getType()) && lesson.getId().equals(s.getReferenceId()));
            if (!alreadySuggested) {
                suggestions.add(new RecommendationDto.Suggestion(
                        "LESSON",
                        "Complete: " + lesson.getTitle(),
                        "You haven't finished this lesson yet. Complete it to improve your knowledge.",
                        lesson.getId(),
                        "RECOMMEND.SUG.COMPLETE_TITLE",
                        "RECOMMEND.SUG.COMPLETE_DESC",
                        Map.of("lesson", lesson.getTitle())
                ));
            }
        }

        // If no quizzes taken, suggest starting
        if (results.isEmpty()) {
            suggestions.add(new RecommendationDto.Suggestion(
                    "QUIZ",
                    "Take Your First Quiz",
                    "Start with a quiz to assess your current knowledge level.",
                    null,
                    "RECOMMEND.SUG.FIRST_QUIZ_TITLE",
                    "RECOMMEND.SUG.FIRST_QUIZ_DESC",
                    Map.of()
            ));
        }

        return new RecommendationDto(weakTopics, suggestions);
    }
}
