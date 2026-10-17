package com.chemlab.repository;

import com.chemlab.entity.ClassRoom;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ClassRoomRepository extends JpaRepository<ClassRoom, Long> {
    List<ClassRoom> findAllByOrderByNameAsc();

    /** Cac lop ma giao vien duoc phan cong. */
    List<ClassRoom> findByTeachers_IdOrderByNameAsc(Long teacherId);

    boolean existsByNameIgnoreCase(String name);

    boolean existsByIdAndTeachers_Id(Long classId, Long teacherId);

    boolean existsByIdAndLessons_Id(Long classId, Long lessonId);

    boolean existsByIdAndExams_Id(Long classId, Long examId);

    /** Dung de go bai hoc / de thi / giao vien khoi cac lop truoc khi xoa. */
    List<ClassRoom> findByLessons_Id(Long lessonId);

    List<ClassRoom> findByExams_Id(Long examId);
}
