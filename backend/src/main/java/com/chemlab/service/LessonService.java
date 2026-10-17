package com.chemlab.service;

import com.chemlab.dto.CreateLessonRequest;
import com.chemlab.entity.ClassRoom;
import com.chemlab.entity.Lesson;
import com.chemlab.entity.Molecule;
import com.chemlab.entity.User;
import com.chemlab.repository.ClassRoomRepository;
import com.chemlab.repository.LessonProgressRepository;
import com.chemlab.repository.LessonRepository;
import com.chemlab.repository.MoleculeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.function.Predicate;

@Service
public class LessonService {

    private final LessonRepository lessonRepository;
    private final MoleculeRepository moleculeRepository;
    private final LessonProgressRepository lessonProgressRepository;
    private final ClassRoomRepository classRoomRepository;
    private final ClassAccessService classAccessService;

    public LessonService(LessonRepository lessonRepository,
                         MoleculeRepository moleculeRepository,
                         LessonProgressRepository lessonProgressRepository,
                         ClassRoomRepository classRoomRepository,
                         ClassAccessService classAccessService) {
        this.lessonRepository = lessonRepository;
        this.moleculeRepository = moleculeRepository;
        this.lessonProgressRepository = lessonProgressRepository;
        this.classRoomRepository = classRoomRepository;
        this.classAccessService = classAccessService;
    }

    /**
     * Bai hoc nguoi dung duoc thay: hoc sinh chi thay bai hoc da gan cho lop cua minh,
     * giao vien va quan tri vien thay toan bo kho bai hoc de bien soan.
     */
    public List<Lesson> getVisibleLessons(User user) {
        if (user.getRole() != User.Role.STUDENT) {
            return lessonRepository.findAll();
        }
        ClassRoom classRoom = user.getClassRoom();
        return classRoom == null ? List.of() : lessonRepository.findByClassId(classRoom.getId());
    }

    public List<Lesson> getAllLessons(String userEmail) {
        return getVisibleLessons(classAccessService.requireUser(userEmail));
    }

    public List<Lesson> searchLessonsByTitle(String userEmail, String title) {
        String keyword = title.toLowerCase();
        return filterVisible(userEmail, l -> l.getTitle().toLowerCase().contains(keyword));
    }

    public Lesson getLessonById(String userEmail, Long id) {
        Lesson lesson = lessonRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Lesson not found"));
        classAccessService.checkCanAccessLesson(classAccessService.requireUser(userEmail), id);
        return lesson;
    }

    public List<Lesson> getLessonsByTopic(String userEmail, String topic) {
        return filterVisible(userEmail, l -> topic.equals(l.getTopic()));
    }

    public List<Lesson> getLessonsByDifficulty(String userEmail, String difficulty) {
        return filterVisible(userEmail, l -> difficulty.equals(l.getDifficulty()));
    }

    private List<Lesson> filterVisible(String userEmail, Predicate<Lesson> condition) {
        return getAllLessons(userEmail).stream().filter(condition).toList();
    }

    public Lesson createLesson(CreateLessonRequest request) {
        Molecule molecule = null;
        if (request.getMoleculeId() != null) {
            molecule = moleculeRepository.findById(request.getMoleculeId()).orElse(null);
        }
        Lesson lesson = Lesson.builder()
                .title(request.getTitle())
                .content(request.getContent())
                .topic(request.getTopic())
                .difficulty(request.getDifficulty())
                .molecule(molecule)
                .build();
        return lessonRepository.save(lesson);
    }

    public Lesson updateLesson(Long id, CreateLessonRequest request) {
        Lesson lesson = lessonRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Lesson not found"));
        if (request.getTitle() != null) lesson.setTitle(request.getTitle());
        if (request.getContent() != null) lesson.setContent(request.getContent());
        if (request.getTopic() != null) lesson.setTopic(request.getTopic());
        if (request.getDifficulty() != null) lesson.setDifficulty(request.getDifficulty());
        if (request.getMoleculeId() != null) {
            Molecule molecule = moleculeRepository.findById(request.getMoleculeId()).orElse(null);
            lesson.setMolecule(molecule);
        }
        return lessonRepository.save(lesson);
    }

    /**
     * Xoa bai hoc. Phai xoa tien do hoc tro den bai nay va go bai khoi cac lop truoc,
     * neu khong khoa ngoai lesson_progress.lesson_id / class_lessons.lesson_id se chan lenh xoa.
     */
    @Transactional
    public void deleteLesson(Long id) {
        if (!lessonRepository.existsById(id)) {
            throw new RuntimeException("Lesson not found");
        }
        for (ClassRoom classRoom : classRoomRepository.findByLessons_Id(id)) {
            classRoom.getLessons().removeIf(l -> l.getId().equals(id));
        }
        lessonProgressRepository.deleteByLessonId(id);
        lessonRepository.deleteById(id);
    }
}
