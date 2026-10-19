package com.chemlab.service;

import com.chemlab.entity.User;
import com.chemlab.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class GamificationService {

    private final UserRepository userRepository;

    private static final int BASE_XP = 100;
    private static final double XP_MULTIPLIER = 1.25;

    public void addXp(String email, int xpAmount) {
        userRepository.findByEmail(email).ifPresent(user -> {
            user.setXp(user.getXp() + xpAmount);
            checkLevelUp(user);
            userRepository.save(user);
        });
    }

    public void awardBadge(String email, String badgeName) {
        userRepository.findByEmail(email).ifPresent(user -> {
            List<String> badges = user.getBadges();
            if (!badges.contains(badgeName)) {
                badges.add(badgeName);
                user.setBadges(badges);
                userRepository.save(user);
            }
        });
    }

    private void checkLevelUp(User user) {
        int currentLevel = user.getLevel();
        int xpNeededForNextLevel = calculateXpForLevel(currentLevel + 1);
        
        boolean leveledUp = false;
        while (user.getXp() >= xpNeededForNextLevel) {
            currentLevel++;
            user.setLevel(currentLevel);
            xpNeededForNextLevel = calculateXpForLevel(currentLevel + 1);
            leveledUp = true;
        }
        
        if (leveledUp) {
            // Optional: You can trigger events or WebSocket notifications here
        }
    }

    // Level 2 needs 100 XP, Level 3 needs 100 + 125 = 225 XP, etc.
    private int calculateXpForLevel(int level) {
        if (level <= 1) return 0;
        int totalXpNeeded = 0;
        for (int i = 2; i <= level; i++) {
            totalXpNeeded += (int) (BASE_XP * Math.pow(XP_MULTIPLIER, i - 2));
        }
        return totalXpNeeded;
    }
}
