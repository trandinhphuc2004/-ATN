package com.chemlab.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;
import java.util.List;

@Data
public class CreateExamRequest {
    @NotBlank
    private String title;

    private String description;

    @Min(1)
    private int timeLimitMinutes;

    private boolean randomOrder = true;

    private String topic;
    private String difficulty;

    // Option 1: pick existing question IDs
    private List<Long> questionIds;

    // Option 2: auto-generate count of random questions from topic
    private Integer randomQuestionCount;

    // Option 3: generate new questions using AI
    private boolean aiGenerated;
}
