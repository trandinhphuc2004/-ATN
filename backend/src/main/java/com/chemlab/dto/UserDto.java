package com.chemlab.dto;

import com.chemlab.entity.User;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserDto {
    private Long id;
    private String name;
    private String email;
    private String role;
    private LocalDateTime createdAt;
    private Integer xp;
    private Integer level;
    private java.util.List<String> badges;
    private Long classId;     // Lop cua hoc sinh (null neu chua xep lop / khong phai hoc sinh)
    private String className;

    public static UserDto fromEntity(User user) {
        UserDto dto = new UserDto();
        dto.setId(user.getId());
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole().name());
        dto.setCreatedAt(user.getCreatedAt());
        dto.setXp(user.getXp());
        dto.setLevel(user.getLevel());
        dto.setBadges(user.getBadges());
        if (user.getClassRoom() != null) {
            dto.setClassId(user.getClassRoom().getId());
            dto.setClassName(user.getClassRoom().getName());
        }
        return dto;
    }
}
