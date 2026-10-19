package com.chemlab.service;

import com.chemlab.config.HttpClients;
import com.chemlab.dto.AiLessonRequest;
import com.chemlab.dto.AiLessonResponse;
import com.chemlab.dto.VideoDto;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.netty.http.client.HttpClient;

import java.time.Duration;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

/**
 * Sinh noi dung bai hoc hoa hoc bang AI, kem video bai giang tim tu YouTube.
 *
 * Nguoi dung chi nhap tieu de. Service lam hai viec:
 *   1. Goi model text sinh noi dung bai hoc dang HTML (bang tieng Viet)
 *   2. Goi YouTubeService tim video bai giang lien quan den tieu de do
 *
 * Ket qua CHUA duoc luu vao co so du lieu, tra ve cho nguoi dung xem truoc.
 * Chi khi bam "Luu bai hoc" thi frontend moi goi POST /api/lessons de luu that.
 */
@Service
public class AiLessonGeneratorService {

    private static final Logger log = LoggerFactory.getLogger(AiLessonGeneratorService.class);

    private final WebClient webClient;
    private final String apiKey;
    /**
     * Danh sach model thu lan luot. Model mien phi tren OpenRouter hay bi 429
     * "rate-limited upstream" vi nhieu nguoi dung chung, nen can nhieu lua chon
     * de tinh nang khong that bai hoan toan.
     */
    private final List<String> models;
    private final ObjectMapper objectMapper;
    private final YouTubeService youTubeService;

    public AiLessonGeneratorService(
            @Value("${ai.api.url}") String apiUrl,
            @Value("${ai.api.key}") String apiKey,
            @Value("${ai.api.lesson-models:${ai.api.model}}") String modelList,
            ObjectMapper objectMapper,
            YouTubeService youTubeService) {
        // Timeout 90s: bai hoc dai hon phan ung (can ~2500 token dau ra) nen cho lau hon.
        HttpClient httpClient = HttpClients.create().responseTimeout(Duration.ofSeconds(90));
        this.webClient = WebClient.builder()
                .baseUrl(apiUrl)
                .clientConnector(new ReactorClientHttpConnector(httpClient))
                .codecs(c -> c.defaultCodecs().maxInMemorySize(4 * 1024 * 1024))
                .build();
        this.apiKey = apiKey;
        // Tach theo dau phay, bo khoang trang va phan tu rong.
        this.models = Arrays.stream(modelList.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toList();
        if (this.models.isEmpty()) {
            throw new IllegalStateException(
                    "Chua cau hinh model nao cho ai.api.lesson-models");
        }
        this.objectMapper = objectMapper;
        this.youTubeService = youTubeService;
    }

    /**
     * Sinh bai hoc tu tieu de nguoi dung nhap.
     *
     * @throws IllegalStateException neu AI khong tra ve noi dung dung dinh dang.
     *         Controller bat loi nay va tra ve thong bao gon cho nguoi dung.
     */
    public AiLessonResponse generateLesson(AiLessonRequest request) {
        String prompt = buildPrompt(request);

        // Thu lan luot tung model. Chi lui sang model sau khi gap 429
        // (nha cung cap gioi han tam thoi) - cac loi khac nem ra ngay
        // vi lui model cung khong giup gi.
        Map<?, ?> response = null;
        WebClientResponseException lastRateLimit = null;

        for (int i = 0; i < models.size(); i++) {
            String modelId = models.get(i);
            try {
                response = callModel(modelId, prompt);
                if (i > 0) {
                    log.info("Soan bai hoc thanh cong bang model du phong '{}'", modelId);
                }
                break;
            } catch (WebClientResponseException.TooManyRequests e) {
                lastRateLimit = e;
                boolean coModelKhac = (i + 1) < models.size();
                log.warn("Model '{}' bi gioi han goi (429).{}", modelId,
                        coModelKhac ? " Thu model tiep theo: '" + models.get(i + 1) + "'" : "");
            }
        }

        if (response == null) {
            throw new IllegalStateException(
                    "Tat ca " + models.size() + " model deu bi gioi han goi (429). "
                            + "Vui long thu lai sau it phut.", lastRateLimit);
        }

        String rawContent = extractContent(response);
        AiLessonResponse lesson = parseLesson(rawContent, request);

        // Tim video theo tieu de nguoi dung nhap (khong dung tieu de AI sinh ra:
        // tieu de goc sat y dinh nguoi dung hon).
        String keyword = request.getTitle() + " hoa hoc bai giang";
        List<VideoDto> videos = youTubeService.search(keyword);
        lesson.setVideos(videos);

        return lesson;
    }

    /** Goi mot model cu the. Tach rieng de co the thu lai voi model du phong. */
    private Map<?, ?> callModel(String modelId, String prompt) {
        // response_format json_object: ep model tra JSON hop le, tranh loi parse.
        // temperature 0.5: can sang tao trong cach dien dat nhung phai chinh xac ve hoa hoc.
        Map<String, Object> body = Map.of(
                "model", modelId,
                "messages", List.of(
                        Map.of("role", "system", "content",
                                "Ban la giao vien hoa hoc nguoi Viet, soan bai giang cho hoc sinh trung hoc pho thong. "
                                        + "Ban chi tra ve JSON hop le, khong them loi giai thich nao ngoai JSON."),
                        Map.of("role", "user", "content", prompt)
                ),
                "temperature", 0.5,
                "max_tokens", 4000,
                "response_format", Map.of("type", "json_object")
        );

        return webClient.post()
                .uri("/chat/completions")
                .header("Authorization", "Bearer " + apiKey)
                .header("HTTP-Referer", "http://localhost:4200")
                .header("X-Title", "ChemLab 3D")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(body)
                .retrieve()
                .bodyToMono(Map.class)
                .block();
    }

    private String buildPrompt(AiLessonRequest request) {
        String topicHint = (request.getTopic() == null || request.getTopic().isBlank())
                ? "Tu suy ra chu de phu hop tu tieu de, vi du \"Hinh hoc phan tu\", \"Lien ket hoa hoc\", "
                  + "\"Phan ung oxi hoa khu\", \"Dung dich va nong do\"."
                : "Chu de: " + request.getTopic();

        String depthHint = switch (request.getDifficulty() == null ? "MEDIUM" : request.getDifficulty().toUpperCase()) {
            case "EASY" -> "Muc do de: giai thich tu co ban, tranh cong thuc phuc tap, nhieu vi du doi thuong.";
            case "HARD" -> "Muc do kho: di sau vao co che, co the dung thuyet lai hoa, nang luong lien ket, "
                           + "so sanh nhieu truong hop, them bai tap van dung.";
            default -> "Muc do trung binh: can bang giua giai thich va van dung, bam sat chuong trinh pho thong.";
        };

        // Yeu cau ro rang bang tieng Viet + liet ke the HTML duoc phep,
        // vi model de tu them the div/style hoac markdown neu khong gioi han.
        return String.format("""
                Soan mot bai hoc hoa hoc hoan chinh voi tieu de: "%s"

                %s
                %s

                YEU CAU QUAN TRONG:
                1. Viet HOAN TOAN bang tieng Viet co dau day du. Tuyet doi khong dung tieng Anh
                   trong phan noi dung, tru cong thuc hoa hoc (H2O, NaCl) va ky hieu quoc te (sp3, VSEPR).
                2. Noi dung phai chia thanh 5 den 7 muc duoc danh so, moi muc co tieu de ro rang.
                   Cau truc goi y: dac trung co ban, giai thich co che, ly thuyet lien quan,
                   tinh chat, ung dung thuc te, phan ghi nho tom tat.
                3. Do dai toi thieu 2500 ky tu. Viet day du, giai thich ky, khong viet gach dau dong so sai.
                4. Dung dau phay thap phan theo kieu Viet Nam: viet 104,5 do khong viet 104.5.
                5. Noi dung o dang HTML, CHI dung cac the sau:
                   h2 (tieu de bai), h3 (tieu de muc), p (doan van), ul, li, strong, em, table, tr, th, td,
                   sub (chi so duoi, vi du H<sub>2</sub>O), sup (chi so tren, vi du Ca<sup>2+</sup>).
                   Khong dung the div, span, style, class, script, hay cu phap markdown.
                6. Kien thuc phai CHINH XAC ve mat hoa hoc. Neu khong chac mot so lieu, dung neu ra.

                Tra ve DUNG dinh dang JSON sau, khong them gi khac:
                {"title": "tieu de bai hoc bang tieng Viet",
                 "topic": "chu de ngan gon bang tieng Viet",
                 "content": "<h2>...</h2><p>...</p>..."}
                """, request.getTitle(), topicHint, depthHint);
    }

    private String extractContent(Map<?, ?> response) {
        if (response == null || !response.containsKey("choices")) {
            throw new IllegalStateException("AI khong tra ve truong 'choices'. Phan hoi: " + response);
        }
        List<?> choices = (List<?>) response.get("choices");
        if (choices.isEmpty()) {
            throw new IllegalStateException("AI tra ve danh sach 'choices' rong");
        }
        Map<?, ?> first = (Map<?, ?>) choices.get(0);
        Map<?, ?> message = (Map<?, ?>) first.get("message");
        if (message == null) {
            throw new IllegalStateException("AI tra ve choices khong co 'message'");
        }
        Object content = message.get("content");
        if (content == null || content.toString().isBlank()) {
            throw new IllegalStateException("AI tra ve noi dung rong");
        }
        return content.toString();
    }

    private AiLessonResponse parseLesson(String raw, AiLessonRequest request) {
        try {
            // Model co the boc JSON trong khoi ```json ... ``` du da yeu cau khong lam vay.
            String cleaned = raw.replaceAll("```json\\s*", "").replaceAll("```\\s*", "").trim();
            int start = cleaned.indexOf('{');
            int end = cleaned.lastIndexOf('}');
            if (start >= 0 && end > start) {
                cleaned = cleaned.substring(start, end + 1);
            }

            JsonNode node = objectMapper.readTree(cleaned);
            String content = node.path("content").asText("");
            if (content.isBlank()) {
                throw new IllegalStateException("AI tra ve JSON khong co truong 'content'");
            }

            // Giu tieu de nguoi dung nhap neu AI khong tra ve tieu de nao.
            String title = node.path("title").asText("");
            if (title.isBlank()) {
                title = request.getTitle();
            }

            String topic = node.path("topic").asText("");
            if (topic.isBlank()) {
                topic = (request.getTopic() == null || request.getTopic().isBlank())
                        ? "Hoa hoc tong hop"
                        : request.getTopic();
            }

            return AiLessonResponse.builder()
                    .title(title)
                    .topic(topic)
                    .difficulty(request.getDifficulty() == null ? "MEDIUM" : request.getDifficulty())
                    .content(content)
                    .build();

        } catch (IllegalStateException e) {
            throw e;
        } catch (Exception e) {
            log.error("Khong doc duoc JSON tu AI. Noi dung tho: {}", truncate(raw), e);
            throw new IllegalStateException("AI tra ve du lieu khong dung dinh dang JSON", e);
        }
    }

    private String truncate(String s) {
        if (s == null) {
            return "";
        }
        return s.length() <= 500 ? s : s.substring(0, 500) + "...";
    }
}
