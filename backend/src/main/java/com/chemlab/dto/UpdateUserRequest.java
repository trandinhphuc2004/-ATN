package com.chemlab.dto;

import lombok.Data;

@Data
public class UpdateUserRequest {
    private String name;
    private String email;
    private String role;
    private String password;

    /** Lop cua hoc sinh. Form quan tri luon gui truong nay: null = chua xep lop. */
    private Long classId;
}
