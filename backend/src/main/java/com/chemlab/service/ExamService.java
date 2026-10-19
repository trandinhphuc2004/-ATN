package com.chemlab.service;

import com.chemlab.dto.*;
import com.fasterxml.jackson.core.type.TypeReference;
import com.chemlab.entity.*;
import com.chemlab.repository.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ExamService {

    private final ExamRepository examRepository;
    private final ExamSubmissionRepository submissionRepository;
    private final QuestionRepository questionRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;
    private final AiQuestionGeneratorService aiQuestionGeneratorService;
    private final TopicResolver topicResolver;
    private final ClassAccessService classAccessService;
    private final ClassRoomRepository classRoomRepository;

    public ExamService(ExamRepository examRepository,
                       ExamSubmissionRepository submissionRepository,
                       QuestionRepository questionRepository,
                       UserRepository userRepository,
                       ObjectMapper objectMapper,
                       AiQuestionGeneratorService aiQuestionGeneratorService,
                       TopicResolver topicResolver,
                       ClassAccessService classAccessService,
                       ClassRoomRepository classRoomRepository) {
        this.examRepository = examRepository;
        this.submissionRepository = submissionRepository;
        this.questionRepository = questionRepository;
        this.userRepository = userRepository;
        this.objectMapper = objectMapper;
        this.aiQuestionGeneratorService = aiQuestionGeneratorService;
        this.topicResolver = topicResolver;
        this.classAccessService = classAccessService;
        this.classRoomRepository = classRoomRepository;
    }

    @Transactional
    public ExamDto createExam(String teacherEmail, CreateExamRequest request) {
        User teacher = userRepository.findByEmail(teacherEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Question> questions;
        if (request.isAiGenerated()) {
            // Generate using AI
            AiQuestionRequest aiRequest = new AiQuestionRequest();
            aiRequest.setTopic(request.getTopic() != null && !request.getTopic().isBlank() ? request.getTopic() : "General Chemistry");
            aiRequest.setDifficulty(request.getDifficulty() != null && !request.getDifficulty().isBlank() ? request.getDifficulty() : "MEDIUM");
            aiRequest.setCount(request.getRandomQuestionCount() != null ? request.getRandomQuestionCount() : 10);
            
            List<Question> generated = aiQuestionGeneratorService.generateQuestions(aiRequest);
            // Save questions to DB first
            questions = questionRepository.saveAll(generated);
        } else if (request.getQuestionIds() != null && !request.getQuestionIds().isEmpty()) {
            questions = questionRepository.findAllById(request.getQuestionIds());
        } else if (request.getRandomQuestionCount() != null && request.getRandomQuestionCount() > 0) {
            List<Question> pool;
            if (request.getTopic() != null && !request.getTopic().isBlank()) {
                // Chu de tu giao dien co the la tieng Anh trong khi du lieu luu tieng Viet,
                // nen lay theo moi cach viet cua chu de do.
                pool = questionRepository.findByTopicIn(topicResolver.aliasesOf(request.getTopic()));
            } else {
                pool = questionRepository.findAll();
            }
            // findByTopicIn co the tra ve danh sach khong sua doi duoc, phai sao chep truoc khi tron.
            pool = new ArrayList<>(pool);

            if (request.getDifficulty() != null && !request.getDifficulty().isBlank()) {
                pool.removeIf(q -> !request.getDifficulty().equalsIgnoreCase(q.getDifficulty()));
            }

            if (pool.isEmpty()) {
                throw new IllegalArgumentException(
                        "Khong tim thay cau hoi nao phu hop voi chu de va do kho da chon. "
                                + "Hay chon chu de khac hoac them cau hoi truoc khi tao de thi.");
            }

            // Bao loi ro thay vi lang le tao de thi it cau hon so voi so cau da chon.
            if (pool.size() < request.getRandomQuestionCount()) {
                throw new IllegalArgumentException(
                        "Chi co " + pool.size() + " cau hoi phu hop nhung de thi yeu cau "
                                + request.getRandomQuestionCount() + " cau. "
                                + "Hay giam so cau hoac them cau hoi cho chu de nay.");
            }

            Collections.shuffle(pool);
            questions = pool.stream()
                    .limit(request.getRandomQuestionCount())
                    .collect(Collectors.toList());
        } else {
            questions = new ArrayList<>();
        }

        if (questions.isEmpty()) {
            throw new IllegalArgumentException(
                    "De thi phai co it nhat mot cau hoi. Hay chon cau hoi hoac tang so cau ngau nhien.");
        }

        Exam exam = Exam.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .createdBy(teacher)
                .timeLimitMinutes(request.getTimeLimitMinutes())
                .randomOrder(request.isRandomOrder())
                .topic(request.getTopic())
                .difficulty(request.getDifficulty())
                .active(true)
                .questions(questions)
                .build();

        exam = examRepository.save(exam);
        return toDto(exam, true);
    }

    @Transactional(readOnly = true)
    public List<ExamDto> getTeacherExams(String teacherEmail) {
        User teacher = userRepository.findByEmail(teacherEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return examRepository.findByCreatedByIdOrderByCreatedAtDesc(teacher.getId())
                .stream().map(e -> toDto(e, true)).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ExamDto> getAllExams() {
        return examRepository.findAll().stream()
                .sorted(Comparator.comparing(Exam::getCreatedAt,
                        Comparator.nullsLast(Comparator.<LocalDateTime>reverseOrder())))
                .map(e -> toDto(e, false)).collect(Collectors.toList());
    }

    /** Hoc sinh chi thay de thi dang mo da gan cho lop cua minh. */
    @Transactional(readOnly = true)
    public List<ExamDto> getActiveExams(String userEmail) {
        User user = classAccessService.requireUser(userEmail);
        List<Exam> exams;
        if (user.getRole() == User.Role.STUDENT) {
            exams = user.getClassRoom() == null
                    ? List.of()
                    : examRepository.findActiveByClassId(user.getClassRoom().getId());
        } else {
            exams = examRepository.findByActiveTrueOrderByCreatedAtDesc();
        }
        return exams.stream().map(e -> toDto(e, false)).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ExamDto getExamForStudent(String userEmail, Long examId) {
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new RuntimeException("Exam not found"));
        classAccessService.checkCanAccessExam(classAccessService.requireUser(userEmail), examId);
        ExamDto dto = toDto(exam, false);

        // Include questions without correct answers
        List<Question> questions = exam.getQuestions();
        if (exam.isRandomOrder()) {
            questions = new ArrayList<>(questions);
            Collections.shuffle(questions);
        }
        dto.setQuestions(questions.stream().map(q -> ExamDto.QuestionDto.builder()
                .id(q.getId())
                .question(q.getQuestion())
                .optionA(q.getOptionA())
                .optionB(q.getOptionB())
                .optionC(q.getOptionC())
                .optionD(q.getOptionD())
                .topic(q.getTopic())
                .difficulty(q.getDifficulty())
                .build()
        ).collect(Collectors.toList()));

        return dto;
    }

    @Transactional
    public ExamResultDto submitExam(String studentEmail, ExamSubmissionRequest request) {
        User student = userRepository.findByEmail(studentEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Exam exam = examRepository.findById(request.getExamId())
                .orElseThrow(() -> new RuntimeException("Exam not found"));
        classAccessService.checkCanAccessExam(student, exam.getId());

        Map<Long, Question> questionMap = exam.getQuestions().stream()
                .collect(Collectors.toMap(Question::getId, q -> q));

        int score = 0;
        List<ExamResultDto.ExamQuestionResult> details = new ArrayList<>();

        for (ExamSubmissionRequest.ExamAnswerItem answer : request.getAnswers()) {
            Question q = questionMap.get(answer.getQuestionId());
            if (q == null) continue;

            boolean correct = q.getCorrectAnswer().equalsIgnoreCase(answer.getSelectedAnswer());
            if (correct) score++;

            details.add(ExamResultDto.ExamQuestionResult.builder()
                    .questionId(q.getId())
                    .question(q.getQuestion())
                    .selectedAnswer(answer.getSelectedAnswer())
                    .correctAnswer(q.getCorrectAnswer())
                    .correct(correct)
                    // Luu ca noi dung dap an va loi giai vao answersData de man hinh
                    // chua de con doc duoc sau nay, ke ca khi cau hoi bi sua hoac xoa.
                    .optionA(q.getOptionA())
                    .optionB(q.getOptionB())
                    .optionC(q.getOptionC())
                    .optionD(q.getOptionD())
                    .explanation(q.getExplanation())
                    .build());
        }

        // Save submission
        String answersJson;
        try {
            answersJson = objectMapper.writeValueAsString(details);
        } catch (Exception e) {
            answersJson = "[]";
        }

        LocalDateTime startedAt = null;
        if (request.getStartedAt() != null) {
            try {
                startedAt = LocalDateTime.parse(request.getStartedAt());
            } catch (Exception ignored) {}
        }

        ExamSubmission submission = ExamSubmission.builder()
                .exam(exam)
                .student(student)
                .score(score)
                .totalQuestions(exam.getQuestions().size())
                .answersData(answersJson)
                .startedAt(startedAt)
                .build();
        submissionRepository.save(submission);

        return ExamResultDto.builder()
                .examId(exam.getId())
                .examTitle(exam.getTitle())
                .score(score)
                .totalQuestions(exam.getQuestions().size())
                .percentage(exam.getQuestions().isEmpty() ? 0 :
                        (score * 100.0 / exam.getQuestions().size()))
                .details(details)
                .build();
    }

    /**
     * Xem lai bai thi da nop: dung lai ket qua chi tiet tu answersData da luu khi nop bai,
     * nen hien duoc dap an da chon va dap an dung cho tung cau.
     */
    @Transactional(readOnly = true)
    public ExamResultDto getSubmissionReview(String studentEmail, Long examId) {
        User student = userRepository.findByEmail(studentEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        ExamSubmission submission = submissionRepository
                .findByExamIdAndStudentId(examId, student.getId())
                .orElseThrow(() -> new RuntimeException("Submission not found"));

        List<ExamResultDto.ExamQuestionResult> details;
        try {
            details = objectMapper.readValue(
                    submission.getAnswersData(),
                    new TypeReference<List<ExamResultDto.ExamQuestionResult>>() {});
        } catch (Exception e) {
            details = new ArrayList<>();
        }

        // Bai nop truoc khi bo sung noi dung dap an chi luu chu cai A/B/C/D.
        // Lay lai noi dung tu ngan hang cau hoi de man hinh chua de van day du.
        for (ExamResultDto.ExamQuestionResult d : details) {
            if (d.getOptionA() != null || d.getQuestionId() == null) continue;
            questionRepository.findById(d.getQuestionId()).ifPresent(q -> {
                d.setOptionA(q.getOptionA());
                d.setOptionB(q.getOptionB());
                d.setOptionC(q.getOptionC());
                d.setOptionD(q.getOptionD());
                if (d.getExplanation() == null) d.setExplanation(q.getExplanation());
            });
        }

        int total = submission.getTotalQuestions();
        return ExamResultDto.builder()
                .examId(examId)
                .examTitle(submission.getExam().getTitle())
                .score(submission.getScore())
                .totalQuestions(total)
                .percentage(total == 0 ? 0 : (submission.getScore() * 100.0 / total))
                .details(details)
                .build();
    }

    @Transactional
    public void toggleExamActive(String teacherEmail, Long examId) {
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new RuntimeException("Exam not found"));
        exam.setActive(!exam.isActive());
        examRepository.save(exam);
    }

    @Transactional
    public void deleteExam(String teacherEmail, Long examId) {
        // Go de thi khoi cac lop truoc, neu khong khoa ngoai class_exams.exam_id chan lenh xoa.
        for (ClassRoom classRoom : classRoomRepository.findByExams_Id(examId)) {
            classRoom.getExams().removeIf(e -> e.getId().equals(examId));
        }
        examRepository.deleteById(examId);
    }

    private ExamDto toDto(Exam exam, boolean includeQuestions) {
        ExamDto dto = ExamDto.builder()
                .id(exam.getId())
                .title(exam.getTitle())
                .description(exam.getDescription())
                .timeLimitMinutes(exam.getTimeLimitMinutes())
                .randomOrder(exam.isRandomOrder())
                .topic(exam.getTopic())
                .difficulty(exam.getDifficulty())
                .active(exam.isActive())
                .createdAt(exam.getCreatedAt() != null ? exam.getCreatedAt().toString() : null)
                .createdByName(exam.getCreatedBy().getName())
                .questionCount(exam.getQuestions().size())
                .build();

        if (includeQuestions) {
            dto.setQuestions(exam.getQuestions().stream().map(q -> ExamDto.QuestionDto.builder()
                    .id(q.getId())
                    .question(q.getQuestion())
                    .optionA(q.getOptionA())
                    .optionB(q.getOptionB())
                    .optionC(q.getOptionC())
                    .optionD(q.getOptionD())
                    .topic(q.getTopic())
                    .difficulty(q.getDifficulty())
                    .build()
            ).collect(Collectors.toList()));
        }

        return dto;
    }
}
