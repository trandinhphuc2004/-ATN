package com.chemlab.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateLessonRequest {
    @NotBlank
    private String title;

    private String content;

    @NotBlank
    private String topic;

    @NotBlank
    private String difficulty;

    private Long moleculeId;
}
