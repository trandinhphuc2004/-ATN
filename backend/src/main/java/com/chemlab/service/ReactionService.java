package com.chemlab.service;

import com.chemlab.entity.Reaction;
import com.chemlab.repository.ReactionRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ReactionService {

    private final ReactionRepository reactionRepository;

    public ReactionService(ReactionRepository reactionRepository) {
        this.reactionRepository = reactionRepository;
    }

    public List<Reaction> getAllReactions() {
        return reactionRepository.findAll();
    }

    public Reaction getReactionById(Long id) {
        return reactionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reaction not found: " + id));
    }

    public List<Reaction> getReactionsByType(String type) {
        return reactionRepository.findByReactionType(type);
    }
}
