package com.chemlab.controller;

import com.chemlab.dto.ReactionGeneratorRequest;
import com.chemlab.entity.Reaction;
import com.chemlab.service.AiReactionGeneratorService;
import com.chemlab.service.GamificationService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.security.Principal;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiReactionController {

    private static final Logger log = LoggerFactory.getLogger(AiReactionController.class);

    private final AiReactionGeneratorService aiReactionGeneratorService;
    private final GamificationService gamificationService;

    @PostMapping("/generate-reaction")
    public ResponseEntity<?> generateReaction(@RequestBody ReactionGeneratorRequest request, Principal principal) {
        Reaction reaction;
        try {
            reaction = aiReactionGeneratorService.generateReaction(request);
        } catch (Exception e) {
            // Log day du de debug, nhung tra ve client thong bao gon (khong lo stack trace).
            log.error("generateReaction that bai cho query='{}'", request.getQuery(), e);
            // LUU Y: Map.of() NEM NPE neu value null (vd ReadTimeoutException co getMessage()==null).
            // -> dung reasonMessage() de luon co chuoi khong-null.
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Khong tao duoc phan ung tu AI.", "reason", reasonMessage(e)));
        }

        if (reaction == null) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "AI khong tra ve du lieu phan ung."));
        }

        if (principal != null) {
            gamificationService.addXp(principal.getName(), 30);
            gamificationService.awardBadge(principal.getName(), "Reaction Master");
        }

        return ResponseEntity.ok(reaction);
    }

    /**
     * Tra ve mot chuoi mo ta loi KHONG BAO GIO null (Map.of khong chap nhan null).
     * Mot so exception (vd ReadTimeoutException) co getMessage()==null -> dung ten class lam fallback.
     */
    private String reasonMessage(Throwable e) {
        String msg = e.getMessage();
        if (msg != null && !msg.isBlank()) {
            return msg;
        }
        // Lan theo cause de tim message co nghia (WebClientRequestException hay boc ReadTimeoutException)
        Throwable cause = e.getCause();
        while (cause != null) {
            if (cause.getMessage() != null && !cause.getMessage().isBlank()) {
                return cause.getClass().getSimpleName() + ": " + cause.getMessage();
            }
            cause = cause.getCause();
        }
        return e.getClass().getSimpleName();
    }
}
