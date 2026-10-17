package com.chemlab.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private Integer xp = 0;

    @Column(name = "user_level", nullable = false)
    private Integer level = 1;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "user_badges", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "badge_name")
    private java.util.List<String> badges = new java.util.ArrayList<>();

    /** Lop cua hoc sinh (chi dung cho vai tro STUDENT, moi hoc sinh thuoc dung 1 lop). */
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "class_id")
    @com.fasterxml.jackson.annotation.JsonIgnore
    private ClassRoom classRoom;

    public enum Role {
        STUDENT, TEACHER, ADMIN
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.role == null) {
            this.role = Role.STUDENT;
        }
        if (this.xp == null) this.xp = 0;
        if (this.level == null) this.level = 1;
        if (this.badges == null) this.badges = new java.util.ArrayList<>();
    }
}
