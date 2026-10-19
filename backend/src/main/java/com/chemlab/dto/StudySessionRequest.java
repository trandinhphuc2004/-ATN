package com.chemlab.dto;

import lombok.Data;

@Data
public class StudySessionRequest {
    private String activityType; // LESSON, QUIZ, REACTION, MOLECULE_VIEW
    private Long referenceId;
    private int durationMinutes;
}
