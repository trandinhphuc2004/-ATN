package com.chemlab.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private String type;
    private UserDto user;

    public AuthResponse(String token, UserDto user) {
        this.token = token;
        this.type = "Bearer";
        this.user = user;
    }
}
