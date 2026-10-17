package com.chemlab.repository;

import com.chemlab.entity.Reaction;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ReactionRepository extends JpaRepository<Reaction, Long> {
    List<Reaction> findByReactionType(String reactionType);
}
