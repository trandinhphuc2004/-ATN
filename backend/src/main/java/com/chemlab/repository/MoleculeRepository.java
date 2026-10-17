package com.chemlab.repository;

import com.chemlab.entity.Molecule;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface MoleculeRepository extends JpaRepository<Molecule, Long> {
    Optional<Molecule> findByFormula(String formula);
    List<Molecule> findByNameContainingIgnoreCase(String name);
}
