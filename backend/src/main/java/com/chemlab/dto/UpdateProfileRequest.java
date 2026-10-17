package com.chemlab.dto;

import lombok.Data;

@Data
public class UpdateProfileRequest {
    private String name;
    private String currentPassword;
    private String newPassword;
}
