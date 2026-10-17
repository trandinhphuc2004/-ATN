package com.chemlab.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "reactions")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Reaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String equation; // e.g. "2H2 + O2 → 2H2O"

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "reaction_type")
    private String reactionType; // SYNTHESIS, DECOMPOSITION, COMBUSTION, etc.

    @Column(name = "reactants_data", columnDefinition = "TEXT")
    private String reactantsData; // JSON: atoms + bonds for reactants

    @Column(name = "products_data", columnDefinition = "TEXT")
    private String productsData; // JSON: atoms + bonds for products

    @Column(name = "animation_steps", columnDefinition = "TEXT")
    private String animationSteps; // JSON: step-by-step animation data
}
