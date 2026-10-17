package com.chemlab.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "molecules")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Molecule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String formula;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "atom_data", columnDefinition = "TEXT", nullable = false)
    private String atomData; // JSON string of atoms and bonds (for legacy)

    @Column(columnDefinition = "TEXT")
    private String atomsData;

    @Column(columnDefinition = "TEXT")
    private String bondsData;
}
