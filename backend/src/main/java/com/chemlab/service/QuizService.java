package com.chemlab.service;

import com.chemlab.dto.CreateQuestionRequest;
import com.chemlab.dto.QuizResultDto;
import com.chemlab.dto.QuizSubmission;
import com.chemlab.entity.Question;
import com.chemlab.entity.QuizResult;
import com.chemlab.entity.User;
import com.chemlab.repository.QuestionRepository;
import com.chemlab.repository.QuizResultRepository;
import com.chemlab.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class QuizService {

    private final QuestionRepository questionRepository;
    private final QuizResultRepository quizResultRepository;
    private final UserRepository userRepository;
    private final GamificationService gamificationService;
    private final TopicResolver topicResolver;

    public QuizService(QuestionRepository questionRepository,
                       QuizResultRepository quizResultRepository,
                       UserRepository userRepository,
                       GamificationService gamificationService,
                       TopicResolver topicResolver) {
        this.questionRepository = questionRepository;
        this.quizResultRepository = quizResultRepository;
        this.userRepository = userRepository;
        this.gamificationService = gamificationService;
        this.topicResolver = topicResolver;
    }

    /**
     * Lay cau hoi theo chu de. Giao dien gui ten chu de tieng Anh con du lieu luu
     * ten tieng Viet, nen phai doi chieu qua tat ca cach viet cua chu de do.
     */
    public List<Question> getQuestionsByTopic(String topic) {
        if (topic == null || topic.isBlank()) {
            return questionRepository.findAll();
        }
        return questionRepository.findByTopicIn(topicResolver.aliasesOf(topic));
    }

    public Question createQuestion(CreateQuestionRequest request) {
        Question question = Question.builder()
                .question(request.getQuestion())
                .optionA(request.getOptionA())
                .optionB(request.getOptionB())
                .optionC(request.getOptionC())
                .optionD(request.getOptionD())
                .correctAnswer(request.getCorrectAnswer())
                .topic(request.getTopic())
                .difficulty(request.getDifficulty())
                .explanation(request.getExplanation())
                .build();
        return questionRepository.save(question);
    }

    public void deleteQuestion(Long id) {
        if (!questionRepository.existsById(id)) {
            throw new RuntimeException("Question not found");
        }
        questionRepository.deleteById(id);
    }

    public QuizResultDto submitQuiz(QuizSubmission submission, String userEmail) {
        List<QuizResultDto.QuestionResult> details = new ArrayList<>();
        int score = 0;

        for (QuizSubmission.AnswerItem answer : submission.getAnswers()) {
            Question question = questionRepository.findById(answer.getQuestionId())
                    .orElseThrow(() -> new RuntimeException("Question not found: " + answer.getQuestionId()));

            boolean correct = question.getCorrectAnswer().equalsIgnoreCase(answer.getSelectedAnswer());
            if (correct) score++;

            details.add(new QuizResultDto.QuestionResult(
                    question.getId(),
                    question.getQuestion(),
                    answer.getSelectedAnswer(),
                    question.getCorrectAnswer(),
                    correct
            ));
        }

        int total = submission.getAnswers().size();
        double percentage = total > 0 ? (double) score / total * 100 : 0;

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        QuizResult result = QuizResult.builder()
                .user(user)
                .score(score)
                .totalQuestions(total)
                .topic(submission.getTopic())
                .build();
        quizResultRepository.save(result);

        int baseXp = 50;
        int bonusXp = (int) (percentage / 2);
        gamificationService.addXp(userEmail, baseXp + bonusXp);

        if (percentage == 100) {
            gamificationService.awardBadge(userEmail, "Quiz Whiz");
        }

        return new QuizResultDto(score, total, percentage, details);
    }

    public List<QuizResult> getUserResults(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return quizResultRepository.findByUserIdOrderByCompletedAtDesc(user.getId());
    }
}
