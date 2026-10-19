package com.chemlab.controller;

import com.chemlab.dto.ClassRoomDto;
import com.chemlab.dto.TeacherDashboardDto;
import com.chemlab.service.ClassRoomService;
import com.chemlab.service.TeacherDashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/** Giao vien xem cac lop minh duoc phan cong (SecurityConfig: chi TEACHER / ADMIN). */
@RestController
@RequestMapping("/api/teacher")
public class TeacherController {

    private final TeacherDashboardService dashboardService;
    private final ClassRoomService classRoomService;

    public TeacherController(TeacherDashboardService dashboardService, ClassRoomService classRoomService) {
        this.dashboardService = dashboardService;
        this.classRoomService = classRoomService;
    }

    @GetMapping("/classes")
    public ResponseEntity<List<ClassRoomDto>> getMyClasses(Authentication authentication) {
        return ResponseEntity.ok(classRoomService.getClassesForUser(authentication.getName()));
    }

    @GetMapping("/classes/{classId}/dashboard")
    public ResponseEntity<TeacherDashboardDto> getClassDashboard(@PathVariable Long classId,
                                                                 Authentication authentication) {
        return ResponseEntity.ok(dashboardService.getClassDashboard(authentication.getName(), classId));
    }
}
