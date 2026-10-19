package com.chemlab.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ClassRoomRequest {
    @NotBlank(message = "Ten lop khong duoc de trong")
    private String name;

    private Integer gradeLevel;

    private String schoolYear;

    private String description;
}
