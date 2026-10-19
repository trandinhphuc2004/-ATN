package com.chemlab.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssignmentDto {
    private Long id;
    private String title;
    private String description;
    private String teacherName;
    private LocalDateTime createdAt;
    private LocalDateTime dueDate;
}
