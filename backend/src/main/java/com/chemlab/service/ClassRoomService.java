package com.chemlab.service;

import com.chemlab.dto.ClassRoomDto;
import com.chemlab.dto.ClassRoomRequest;
import com.chemlab.entity.*;
import com.chemlab.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

/**
 * Quan ly lop hoc (chi quan tri vien): tao / sua / xoa lop va gan hoc sinh, giao vien,
 * bai hoc, bai kiem tra vao lop. Giao vien chi doc danh sach lop minh duoc phan cong.
 */
@Service
public class ClassRoomService {

    private final ClassRoomRepository classRoomRepository;
    private final UserRepository userRepository;
    private final LessonRepository lessonRepository;
    private final ExamRepository examRepository;
    private final ClassAccessService classAccessService;

    public ClassRoomService(ClassRoomRepository classRoomRepository,
                            UserRepository userRepository,
                            LessonRepository lessonRepository,
                            ExamRepository examRepository,
                            ClassAccessService classAccessService) {
        this.classRoomRepository = classRoomRepository;
        this.userRepository = userRepository;
        this.lessonRepository = lessonRepository;
        this.examRepository = examRepository;
        this.classAccessService = classAccessService;
    }

    @Transactional(readOnly = true)
    public List<ClassRoomDto> getAllClasses() {
        return classRoomRepository.findAllByOrderByNameAsc().stream().map(this::toSummary).toList();
    }

    /** Quan tri vien thay moi lop, giao vien chi thay lop minh duoc phan cong. */
    @Transactional(readOnly = true)
    public List<ClassRoomDto> getClassesForUser(String email) {
        User user = classAccessService.requireUser(email);
        List<ClassRoom> classes = user.getRole() == User.Role.ADMIN
                ? classRoomRepository.findAllByOrderByNameAsc()
                : classRoomRepository.findByTeachers_IdOrderByNameAsc(user.getId());
        return classes.stream().map(this::toSummary).toList();
    }

    @Transactional(readOnly = true)
    public ClassRoomDto getClassDetail(Long id) {
        return toDetail(findClass(id));
    }

    @Transactional
    public ClassRoomDto createClass(ClassRoomRequest request) {
        String name = request.getName().trim();
        if (classRoomRepository.existsByNameIgnoreCase(name)) {
            throw new IllegalArgumentException("Ten lop " + name + " da ton tai");
        }
        ClassRoom classRoom = ClassRoom.builder()
                .name(name)
                .gradeLevel(request.getGradeLevel())
                .schoolYear(request.getSchoolYear())
                .description(request.getDescription())
                .build();
        return toSummary(classRoomRepository.save(classRoom));
    }

    @Transactional
    public ClassRoomDto updateClass(Long id, ClassRoomRequest request) {
        ClassRoom classRoom = findClass(id);
        String name = request.getName().trim();
        if (!name.equalsIgnoreCase(classRoom.getName()) && classRoomRepository.existsByNameIgnoreCase(name)) {
            throw new IllegalArgumentException("Ten lop " + name + " da ton tai");
        }
        classRoom.setName(name);
        classRoom.setGradeLevel(request.getGradeLevel());
        classRoom.setSchoolYear(request.getSchoolYear());
        classRoom.setDescription(request.getDescription());
        return toSummary(classRoomRepository.save(classRoom));
    }

    /** Xoa lop: hoc sinh cua lop tro thanh "chua xep lop", cac lien ket gan khac bi go theo. */
    @Transactional
    public void deleteClass(Long id) {
        ClassRoom classRoom = findClass(id);
        for (User student : userRepository.findByClassRoom_IdOrderByNameAsc(id)) {
            student.setClassRoom(null);
        }
        classRoom.getTeachers().clear();
        classRoom.getLessons().clear();
        classRoom.getExams().clear();
        classRoomRepository.delete(classRoom);
    }

    /**
     * Dat lai danh sach hoc sinh cua lop. Hoc sinh dang o lop khac se duoc chuyen sang lop nay
     * (moi hoc sinh chi thuoc 1 lop); hoc sinh bi bo khoi danh sach tro thanh "chua xep lop".
     */
    @Transactional
    public ClassRoomDto setStudents(Long id, List<Long> studentIds) {
        ClassRoom classRoom = findClass(id);
        Set<Long> wanted = new HashSet<>(studentIds);
        for (User current : userRepository.findByClassRoom_IdOrderByNameAsc(id)) {
            if (!wanted.contains(current.getId())) current.setClassRoom(null);
        }
        for (User student : findUsers(wanted, User.Role.STUDENT, "hoc sinh")) {
            student.setClassRoom(classRoom);
        }
        return toDetail(classRoom);
    }

    @Transactional
    public ClassRoomDto setTeachers(Long id, List<Long> teacherIds) {
        ClassRoom classRoom = findClass(id);
        List<User> teachers = findUsers(new HashSet<>(teacherIds), User.Role.TEACHER, "giao vien");
        classRoom.getTeachers().clear();
        classRoom.getTeachers().addAll(teachers);
        return toDetail(classRoom);
    }

    @Transactional
    public ClassRoomDto setLessons(Long id, List<Long> lessonIds) {
        ClassRoom classRoom = findClass(id);
        Set<Long> wanted = new LinkedHashSet<>(lessonIds);
        List<Lesson> lessons = lessonRepository.findAllById(wanted);
        if (lessons.size() != wanted.size()) {
            throw new IllegalArgumentException("Co bai hoc khong ton tai trong danh sach gan vao lop");
        }
        classRoom.getLessons().clear();
        classRoom.getLessons().addAll(lessons);
        return toDetail(classRoom);
    }

    @Transactional
    public ClassRoomDto setExams(Long id, List<Long> examIds) {
        ClassRoom classRoom = findClass(id);
        Set<Long> wanted = new LinkedHashSet<>(examIds);
        List<Exam> exams = examRepository.findAllById(wanted);
        if (exams.size() != wanted.size()) {
            throw new IllegalArgumentException("Co bai kiem tra khong ton tai trong danh sach gan vao lop");
        }
        classRoom.getExams().clear();
        classRoom.getExams().addAll(exams);
        return toDetail(classRoom);
    }

    private List<User> findUsers(Set<Long> ids, User.Role role, String roleLabel) {
        List<User> users = userRepository.findAllById(ids);
        if (users.size() != ids.size()) {
            throw new IllegalArgumentException("Co " + roleLabel + " khong ton tai trong danh sach gan vao lop");
        }
        for (User u : users) {
            if (u.getRole() != role) {
                throw new IllegalArgumentException("Tai khoan " + u.getEmail() + " khong phai " + roleLabel);
            }
        }
        return users;
    }

    private ClassRoom findClass(Long id) {
        return classRoomRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Class not found"));
    }

    private ClassRoomDto toSummary(ClassRoom c) {
        return ClassRoomDto.summaryOf(c, userRepository.countByClassRoom_Id(c.getId()));
    }

    private ClassRoomDto toDetail(ClassRoom c) {
        List<User> students = userRepository.findByClassRoom_IdOrderByNameAsc(c.getId());
        ClassRoomDto dto = ClassRoomDto.summaryOf(c, students.size());
        dto.setStudents(students.stream().map(ClassRoomDto.Member::of).toList());
        dto.setTeachers(c.getTeachers().stream()
                .sorted(Comparator.comparing(User::getName))
                .map(ClassRoomDto.Member::of).toList());
        dto.setLessons(c.getLessons().stream()
                .sorted(Comparator.comparing(Lesson::getId))
                .map(ClassRoomDto.LessonItem::of).toList());
        dto.setExams(c.getExams().stream()
                .sorted(Comparator.comparing(Exam::getId))
                .map(ClassRoomDto.ExamItem::of).toList());
        return dto;
    }
}
