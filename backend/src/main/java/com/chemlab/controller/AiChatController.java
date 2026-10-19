package com.chemlab.controller;

import com.chemlab.dto.ChatRequest;
import com.chemlab.dto.ChatResponse;
import com.chemlab.service.AiChatService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import com.chemlab.service.GamificationService;

@RestController
@RequestMapping("/api/ai")
public class AiChatController {

    private final AiChatService aiChatService;
    private final GamificationService gamificationService;

    public AiChatController(AiChatService aiChatService, GamificationService gamificationService) {
        this.aiChatService = aiChatService;
        this.gamificationService = gamificationService;
    }

    @PostMapping("/chat")
    public ResponseEntity<ChatResponse> chat(@Valid @RequestBody ChatRequest request, Principal principal) {
        if (principal != null) {
            gamificationService.addXp(principal.getName(), 10); // 10 XP per question
        }
        return ResponseEntity.ok(aiChatService.chat(request));
    }
}
