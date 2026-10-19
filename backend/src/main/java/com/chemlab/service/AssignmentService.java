package com.chemlab.service;

import com.chemlab.dto.AssignmentDto;
import com.chemlab.entity.Assignment;
import com.chemlab.entity.User;
import com.chemlab.repository.AssignmentRepository;
import com.chemlab.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AssignmentService {

    private final AssignmentRepository assignmentRepository;
    private final UserRepository userRepository;

    public AssignmentDto createAssignment(String title, String description, Long teacherId) {
        User teacher = userRepository.findById(teacherId)
                .orElseThrow(() -> new RuntimeException("Teacher not found"));
        
        Assignment assignment = Assignment.builder()
                .title(title)
                .description(description)
                .teacher(teacher)
                .build();
        
        return mapToDto(assignmentRepository.save(assignment));
    }

    public List<AssignmentDto> getAssignmentsByTeacher(Long teacherId) {
        return assignmentRepository.findByTeacherId(teacherId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<AssignmentDto> getAllAssignments() {
        return assignmentRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public void deleteAssignment(Long id) {
        assignmentRepository.deleteById(id);
    }

    private AssignmentDto mapToDto(Assignment assignment) {
        return AssignmentDto.builder()
                .id(assignment.getId())
                .title(assignment.getTitle())
                .description(assignment.getDescription())
                .teacherName(assignment.getTeacher().getName())
                .createdAt(assignment.getCreatedAt())
                .dueDate(assignment.getDueDate())
                .build();
    }
}
