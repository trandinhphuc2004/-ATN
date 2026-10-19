package com.chemlab.controller;

import com.chemlab.dto.AiMoleculeRequest;
import com.chemlab.entity.Molecule;
import com.chemlab.service.AiMoleculeGeneratorService;
import com.chemlab.service.GamificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;

@RestController
@RequestMapping("/api/ai/molecule")
public class AiMoleculeController {

    private final AiMoleculeGeneratorService aiMoleculeGeneratorService;
    private final GamificationService gamificationService;

    public AiMoleculeController(AiMoleculeGeneratorService aiMoleculeGeneratorService, 
                               GamificationService gamificationService) {
        this.aiMoleculeGeneratorService = aiMoleculeGeneratorService;
        this.gamificationService = gamificationService;
    }

    @PostMapping("/generate")
    public ResponseEntity<Molecule> generateMolecule(@RequestBody AiMoleculeRequest request, Principal principal) {
        Molecule molecule = aiMoleculeGeneratorService.generateMolecule(request);
        if (molecule != null) {
            // Reward user for using AI features
            if (principal != null) {
                try {
                    gamificationService.addXp(principal.getName(), 20);
                } catch (Exception e) {
                    // Ignore gamification errors
                }
            }
            return ResponseEntity.ok(molecule);
        }
        return ResponseEntity.status(500).build();
    }
}
