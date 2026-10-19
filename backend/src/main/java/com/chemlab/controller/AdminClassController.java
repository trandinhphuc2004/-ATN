package com.chemlab.controller;

import com.chemlab.dto.ClassRoomDto;
import com.chemlab.dto.ClassRoomRequest;
import com.chemlab.dto.IdListRequest;
import com.chemlab.service.ClassRoomService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/** Quan tri vien quan ly lop hoc (duong dan /api/admin/** chi danh cho ADMIN). */
@RestController
@RequestMapping("/api/admin/classes")
public class AdminClassController {

    private final ClassRoomService classRoomService;

    public AdminClassController(ClassRoomService classRoomService) {
        this.classRoomService = classRoomService;
    }

    @GetMapping
    public ResponseEntity<List<ClassRoomDto>> getClasses() {
        return ResponseEntity.ok(classRoomService.getAllClasses());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ClassRoomDto> getClass(@PathVariable Long id) {
        return ResponseEntity.ok(classRoomService.getClassDetail(id));
    }

    @PostMapping
    public ResponseEntity<ClassRoomDto> createClass(@Valid @RequestBody ClassRoomRequest request) {
        return ResponseEntity.ok(classRoomService.createClass(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ClassRoomDto> updateClass(@PathVariable Long id,
                                                    @Valid @RequestBody ClassRoomRequest request) {
        return ResponseEntity.ok(classRoomService.updateClass(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteClass(@PathVariable Long id) {
        classRoomService.deleteClass(id);
        return ResponseEntity.ok(Map.of("message", "Class deleted successfully"));
    }

    @PutMapping("/{id}/students")
    public ResponseEntity<ClassRoomDto> setStudents(@PathVariable Long id, @RequestBody IdListRequest request) {
        return ResponseEntity.ok(classRoomService.setStudents(id, request.getIds()));
    }

    @PutMapping("/{id}/teachers")
    public ResponseEntity<ClassRoomDto> setTeachers(@PathVariable Long id, @RequestBody IdListRequest request) {
        return ResponseEntity.ok(classRoomService.setTeachers(id, request.getIds()));
    }

    @PutMapping("/{id}/lessons")
    public ResponseEntity<ClassRoomDto> setLessons(@PathVariable Long id, @RequestBody IdListRequest request) {
        return ResponseEntity.ok(classRoomService.setLessons(id, request.getIds()));
    }

    @PutMapping("/{id}/exams")
    public ResponseEntity<ClassRoomDto> setExams(@PathVariable Long id, @RequestBody IdListRequest request) {
        return ResponseEntity.ok(classRoomService.setExams(id, request.getIds()));
    }
}
