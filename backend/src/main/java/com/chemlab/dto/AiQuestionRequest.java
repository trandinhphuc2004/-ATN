package com.chemlab.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AiQuestionRequest {
    @NotBlank
    private String topic;

    private String difficulty = "MEDIUM"; // EASY, MEDIUM, HARD

    @Min(1) @Max(20)
    private int count = 5;
}
