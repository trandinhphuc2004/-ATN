package com.chemlab.controller;

import com.chemlab.dto.VideoDto;
import com.chemlab.entity.Lesson;
import com.chemlab.entity.Reaction;
import com.chemlab.repository.LessonRepository;
import com.chemlab.repository.ReactionRepository;
import com.chemlab.service.YouTubeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Tra ve danh sach video YouTube goi y cho bai hoc, phan ung hoac mot tu khoa bat ky.
 *
 * Tu khoa duoc ghep tu tieu de va chu de trong co so du lieu, cong them cac tu
 * dinh huong tieng Viet nhu "hoa hoc", "bai giang" de ket qua sat noi dung hoc tap
 * thay vi ra video giai tri trung ten.
 */
@RestController
@RequestMapping("/api/videos")
@RequiredArgsConstructor
public class VideoController {

    private final YouTubeService youTubeService;
    private final LessonRepository lessonRepository;
    private final ReactionRepository reactionRepository;

    /** Frontend goi truoc de biet co nen hien khu vuc video hay khong. */
    @GetMapping("/status")
    public Map<String, Boolean> status() {
        return Map.of("enabled", youTubeService.isEnabled());
    }

    /** Video goi y cho mot bai hoc. */
    @GetMapping("/lesson/{id}")
    public ResponseEntity<List<VideoDto>> forLesson(@PathVariable Long id) {
        Lesson lesson = lessonRepository.findById(id).orElse(null);
        if (lesson == null) {
            return ResponseEntity.notFound().build();
        }
        // Ghep tieu de + chu de de tu khoa cu the hon, tranh ra video khong lien quan.
        String keyword = lesson.getTitle() + " " + lesson.getTopic() + " hoa hoc bai giang";
        return ResponseEntity.ok(youTubeService.search(keyword));
    }

    /** Video goi y cho mot phan ung hoa hoc. */
    @GetMapping("/reaction/{id}")
    public ResponseEntity<List<VideoDto>> forReaction(@PathVariable Long id) {
        Reaction reaction = reactionRepository.findById(id).orElse(null);
        if (reaction == null) {
            return ResponseEntity.notFound().build();
        }
        String keyword = reaction.getName() + " " + reaction.getEquation() + " phan ung hoa hoc";
        return ResponseEntity.ok(youTubeService.search(keyword));
    }

    /**
     * Tim video theo tu khoa tuy y. Dung cho phan ung / bai hoc vua duoc AI tao ra
     * nhung chua luu vao co so du lieu, nen chua co id de tra cuu.
     */
    @GetMapping("/search")
    public List<VideoDto> search(@RequestParam String q) {
        return youTubeService.search(q + " hoa hoc");
    }
}
