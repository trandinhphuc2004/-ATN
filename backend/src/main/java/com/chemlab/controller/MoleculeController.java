package com.chemlab.controller;

import com.chemlab.dto.CreateMoleculeRequest;
import com.chemlab.entity.Molecule;
import com.chemlab.service.MoleculeService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/molecules")
public class MoleculeController {

    private final MoleculeService moleculeService;

    public MoleculeController(MoleculeService moleculeService) {
        this.moleculeService = moleculeService;
    }

    @GetMapping
    public ResponseEntity<List<Molecule>> getAllMolecules(@RequestParam(required = false) String name) {
        if (name != null && !name.isEmpty()) {
            return ResponseEntity.ok(moleculeService.searchByName(name));
        }
        return ResponseEntity.ok(moleculeService.getAllMolecules());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Molecule> getMoleculeById(@PathVariable Long id) {
        return ResponseEntity.ok(moleculeService.getMoleculeById(id));
    }

    @GetMapping("/formula/{formula}")
    public ResponseEntity<Molecule> getMoleculeByFormula(@PathVariable String formula) {
        return ResponseEntity.ok(moleculeService.getMoleculeByFormula(formula));
    }

    @PostMapping
    public ResponseEntity<Molecule> createMolecule(@Valid @RequestBody CreateMoleculeRequest request) {
        return ResponseEntity.ok(moleculeService.createMolecule(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Molecule> updateMolecule(@PathVariable Long id,
                                                    @RequestBody CreateMoleculeRequest request) {
        return ResponseEntity.ok(moleculeService.updateMolecule(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteMolecule(@PathVariable Long id) {
        moleculeService.deleteMolecule(id);
        return ResponseEntity.ok(Map.of("message", "Molecule deleted successfully"));
    }
}
