package com.chemlab.service;

import com.chemlab.entity.ClassRoom;
import com.chemlab.entity.User;
import com.chemlab.repository.ClassRoomRepository;
import com.chemlab.repository.UserRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

/**
 * Tap trung cac quy tac phan quyen theo lop:
 *  - Hoc sinh chi duoc hoc bai hoc / lam de thi da gan vao lop cua minh.
 *  - Giao vien chi xem duoc du lieu (diem, tien do, bai hoc) cua lop minh duoc phan cong.
 *  - Quan tri vien xem duoc moi lop.
 */
@Service
public class ClassAccessService {

    private final UserRepository userRepository;
    private final ClassRoomRepository classRoomRepository;

    public ClassAccessService(UserRepository userRepository, ClassRoomRepository classRoomRepository) {
        this.userRepository = userRepository;
        this.classRoomRepository = classRoomRepository;
    }

    public User requireUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public void checkCanViewClass(User user, Long classId) {
        if (user.getRole() == User.Role.ADMIN) return;
        if (user.getRole() == User.Role.TEACHER
                && classRoomRepository.existsByIdAndTeachers_Id(classId, user.getId())) return;
        throw new AccessDeniedException("Ban khong duoc phan cong vao lop nay nen khong xem duoc thong tin cua lop");
    }

    public void checkCanAccessLesson(User user, Long lessonId) {
        if (user.getRole() != User.Role.STUDENT) return;
        ClassRoom classRoom = user.getClassRoom();
        if (classRoom == null || !classRoomRepository.existsByIdAndLessons_Id(classRoom.getId(), lessonId)) {
            throw new AccessDeniedException("Bai hoc nay chua duoc giao cho lop cua ban");
        }
    }

    public void checkCanAccessExam(User user, Long examId) {
        if (user.getRole() != User.Role.STUDENT) return;
        ClassRoom classRoom = user.getClassRoom();
        if (classRoom == null || !classRoomRepository.existsByIdAndExams_Id(classRoom.getId(), examId)) {
            throw new AccessDeniedException("Bai kiem tra nay chua duoc giao cho lop cua ban");
        }
    }
}
