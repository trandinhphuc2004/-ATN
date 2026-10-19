package com.chemlab.controller;

import com.chemlab.entity.Reaction;
import com.chemlab.service.ReactionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reactions")
public class ReactionController {

    private final ReactionService reactionService;

    public ReactionController(ReactionService reactionService) {
        this.reactionService = reactionService;
    }

    @GetMapping
    public ResponseEntity<List<Reaction>> getAllReactions() {
        return ResponseEntity.ok(reactionService.getAllReactions());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Reaction> getReactionById(@PathVariable Long id) {
        return ResponseEntity.ok(reactionService.getReactionById(id));
    }

    @GetMapping("/type/{type}")
    public ResponseEntity<List<Reaction>> getReactionsByType(@PathVariable String type) {
        return ResponseEntity.ok(reactionService.getReactionsByType(type));
    }
}
