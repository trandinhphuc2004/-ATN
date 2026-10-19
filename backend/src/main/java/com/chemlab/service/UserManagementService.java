package com.chemlab.service;

import com.chemlab.dto.*;
import com.chemlab.entity.ClassRoom;
import com.chemlab.entity.User;
import com.chemlab.repository.ClassRoomRepository;
import com.chemlab.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserManagementService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final ClassRoomRepository classRoomRepository;

    public UserManagementService(UserRepository userRepository, PasswordEncoder passwordEncoder,
                                 ClassRoomRepository classRoomRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.classRoomRepository = classRoomRepository;
    }

    public List<UserDto> getAllUsers(String name, String email, String role, Long classId) {
        User.Role roleEnum = null;
        if (role != null && !role.isEmpty()) {
            try {
                roleEnum = User.Role.valueOf(role.toUpperCase());
            } catch (IllegalArgumentException ignored) {}
        }
        String nameParam = (name != null && !name.isEmpty()) ? name : null;
        String emailParam = (email != null && !email.isEmpty()) ? email : null;
        return userRepository.searchUsers(nameParam, emailParam, roleEnum, classId)
                .stream().map(UserDto::fromEntity).collect(Collectors.toList());
    }

    public UserDto getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return UserDto.fromEntity(user);
    }

    @Transactional
    public UserDto createUser(CreateUserRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }
        User.Role role = User.Role.STUDENT;
        if (request.getRole() != null && !request.getRole().isEmpty()) {
            try {
                role = User.Role.valueOf(request.getRole().toUpperCase());
            } catch (IllegalArgumentException ignored) {}
        }
        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(role)
                .classRoom(role == User.Role.STUDENT ? findClass(request.getClassId()) : null)
                .build();
        return UserDto.fromEntity(userRepository.save(user));
    }

    @Transactional
    public UserDto updateUser(Long id, UpdateUserRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (request.getName() != null && !request.getName().isEmpty()) {
            user.setName(request.getName());
        }
        if (request.getEmail() != null && !request.getEmail().isEmpty()
                && !request.getEmail().equals(user.getEmail())) {
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new RuntimeException("Email already exists");
            }
            user.setEmail(request.getEmail());
        }
        if (request.getRole() != null && !request.getRole().isEmpty()) {
            try {
                user.setRole(User.Role.valueOf(request.getRole().toUpperCase()));
            } catch (IllegalArgumentException ignored) {}
        }
        if (request.getPassword() != null && !request.getPassword().isEmpty()) {
            user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        }
        // Chi hoc sinh moi thuoc lop; giao vien duoc phan cong qua man hinh quan ly lop hoc.
        user.setClassRoom(user.getRole() == User.Role.STUDENT ? findClass(request.getClassId()) : null);
        if (user.getRole() != User.Role.TEACHER) {
            removeFromTeachingClasses(user);
        }
        return UserDto.fromEntity(userRepository.save(user));
    }

    @Transactional
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        // Go giao vien khoi cac lop truoc, neu khong khoa ngoai class_teachers.teacher_id chan lenh xoa.
        removeFromTeachingClasses(user);
        userRepository.delete(user);
    }

    private void removeFromTeachingClasses(User user) {
        for (ClassRoom classRoom : classRoomRepository.findByTeachers_IdOrderByNameAsc(user.getId())) {
            classRoom.getTeachers().removeIf(t -> t.getId().equals(user.getId()));
        }
    }

    private ClassRoom findClass(Long classId) {
        if (classId == null) return null;
        return classRoomRepository.findById(classId)
                .orElseThrow(() -> new RuntimeException("Class not found"));
    }

    public byte[] exportToCsv(String name, String email, String role, Long classId) {
        List<UserDto> users = getAllUsers(name, email, role, classId);
        StringBuilder csv = new StringBuilder();
        // BOM UTF-8: giup Excel hien thi dung tieng Viet co dau
        csv.append("\uFEFF");
        csv.append("ID,Name,Email,Role,Class,Created At,XP,Level\n");
        for (UserDto u : users) {
            csv.append(u.getId()).append(",")
               .append(escapeCsv(u.getName())).append(",")
               .append(escapeCsv(u.getEmail())).append(",")
               .append(u.getRole()).append(",")
               .append(escapeCsv(u.getClassName())).append(",")
               .append(u.getCreatedAt()).append(",")
               .append(u.getXp()).append(",")
               .append(u.getLevel()).append("\n");
        }
        return csv.toString().getBytes(StandardCharsets.UTF_8);
    }

    private String escapeCsv(String val) {
        if (val == null) return "";
        if (val.contains(",") || val.contains("\"") || val.contains("\n")) {
            return "\"" + val.replace("\"", "\"\"") + "\"";
        }
        return val;
    }
}
