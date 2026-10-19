package com.chemlab.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateUserRequest {
    @NotBlank
    private String name;

    @Email @NotBlank
    private String email;

    @NotBlank
    private String password;

    private String role = "STUDENT";

    /** Lop cua hoc sinh; bo qua neu vai tro khong phai STUDENT. */
    private Long classId;
}
