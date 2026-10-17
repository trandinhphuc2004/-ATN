package com.chemlab.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "lessons")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Lesson {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String content;

    @Column(nullable = false)
    private String topic;

    @Column(nullable = false)
    private String difficulty; // EASY, MEDIUM, HARD

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "molecule_id")
    private Molecule molecule;
}
