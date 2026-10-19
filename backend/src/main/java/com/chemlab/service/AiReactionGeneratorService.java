package com.chemlab.service;

import com.chemlab.config.HttpClients;
import com.chemlab.dto.ReactionGeneratorRequest;
import com.chemlab.entity.Reaction;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.netty.http.client.HttpClient;

import java.time.Duration;
import java.util.List;
import java.util.Map;

@Service
public class AiReactionGeneratorService {

    private final WebClient webClient;
    private final String apiKey;
    private final String model;
    private final ObjectMapper objectMapper;

    public AiReactionGeneratorService(
            @Value("${ai.api.url}") String apiUrl,
            @Value("${ai.api.key}") String apiKey,
            @Value("${ai.api.model}") String model,
            ObjectMapper objectMapper) {
        // OpenRouter + mistral-small tra ve nhanh (~13-20s). Timeout 60s: du rong cho request
        // binh thuong nhung van fail ro rang neu API treo, thay vi treo vo han.
        HttpClient httpClient = HttpClients.create()
                .responseTimeout(Duration.ofSeconds(60));
        this.webClient = WebClient.builder()
                .baseUrl(apiUrl)
                .clientConnector(new ReactorClientHttpConnector(httpClient))
                .codecs(c -> c.defaultCodecs().maxInMemorySize(4 * 1024 * 1024)) // 4MB: JSON phan ung co the lon
                .build();
        this.apiKey = apiKey;
        this.model = model;
        this.objectMapper = objectMapper;
    }

    public Reaction generateReaction(ReactionGeneratorRequest request) {
        String prompt = buildPrompt(request.getQuery());

        // NVIDIA NIM dung chuan OpenAI: endpoint /chat/completions, body co "messages".
        // response_format json_object: ep model tra JSON hop le (tranh loi Jackson parse).
        // temperature thap (0.4) de output on dinh, bam sat cau truc JSON yeu cau.
        Map<String, Object> body = Map.of(
                "model", model,
                "messages", List.of(
                        Map.of("role", "user", "content", prompt)
                ),
                "temperature", 0.4,
                "max_tokens", 4000,
                "response_format", Map.of("type", "json_object")
        );

        // OpenRouter khuyen nghi 2 header HTTP-Referer + X-Title de nhan dien app (khong bat buoc).
        @SuppressWarnings("unchecked")
        Map<String, Object> response = webClient.post()
                .uri("/chat/completions")
                .header("Authorization", "Bearer " + apiKey)
                .header("HTTP-Referer", "http://localhost")
                .header("X-Title", "ChemLab 3D")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(body)
                .retrieve()
                .bodyToMono(Map.class)
                .block();

        if (response == null || !response.containsKey("choices")) {
            throw new IllegalStateException("AI response missing 'choices'. Raw response: " + response);
        }

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> choices = (List<Map<String, Object>>) response.get("choices");
        if (choices.isEmpty()) {
            throw new IllegalStateException("AI response 'choices' is empty.");
        }

        Map<String, Object> choice = choices.get(0);

        // finish_reason = "length" nghia la model bi cat giua chung do max_tokens
        // -> JSON khong dong ngoac -> Jackson JsonEOFException. Bao loi ro rang thay vi tra null.
        String finishReason = (String) choice.get("finish_reason");
        if ("length".equals(finishReason)) {
            throw new IllegalStateException(
                    "AI response truncated (finish_reason=length): output vuot qua max_tokens. "
                    + "Tang max_tokens hoac rut ngan yeu cau output.");
        }

        @SuppressWarnings("unchecked")
        Map<String, Object> message = (Map<String, Object>) choice.get("message");
        String text = message == null ? null : (String) message.get("content");
        if (text == null || text.isBlank()) {
            throw new IllegalStateException("AI response content is empty (finish_reason=" + finishReason + ").");
        }

        return parseReactionJson(text);
    }

    private String buildPrompt(String query) {
        // Prompt duoc toi uu de gen NHANH hon: yeu cau mo ta ngan gon va JSON compact
        // (it token output -> phan hoi nhanh hon). Cau truc JSON giu nguyen de frontend khong phai sua.
        return String.format("""
                You are a chemistry simulation expert. Generate 3D molecular data for this reaction: "%s".
                Input may be an equation ("2H2 + O2 -> 2H2O") or Vietnamese/English text ("Đốt cháy Magie"). Auto-correct typos.

                Rules:
                1. Balance the equation.
                2. All text fields (name, description, label) in Vietnamese. Keep descriptions SHORT: max 1 concise sentence each.
                3. reactantsData & productsData: list every molecule. Atoms: element + x,y,z (Angstroms). Bonds: from, to (0-indexed), order (1/2/3).
                4. Exactly 5 animation steps (initial, breaking, transition, forming, final), each with a SHORT Vietnamese description (1 sentence).

                Output ONLY a single compact JSON object (no markdown, no line breaks, no extra spaces). Structure:
                {"name":"...","equation":"...","description":"<=2 câu","reactionType":"...","reactantsData":{"molecules":[{"name":"...","atoms":[{"element":"C","x":0.0,"y":0.0,"z":0.0}],"bonds":[{"from":0,"to":1,"order":1}]}]},"productsData":{"molecules":[...]},"animationSteps":{"steps":[{"label":"Khởi đầu","description":"...","phase":"initial"}]}}
                """, query);
    }

    private Reaction parseReactionJson(String text) {
        // Strip markdown code blocks, chi lay tu dau { den } cuoi cung (bo text thua model them vao).
        String json = extractJsonObject(text);
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> map = objectMapper.readValue(json, Map.class);

            return Reaction.builder()
                    .name((String) map.get("name"))
                    .equation((String) map.get("equation"))
                    .description((String) map.get("description"))
                    .reactionType((String) map.get("reactionType"))
                    .reactantsData(objectMapper.writeValueAsString(map.get("reactantsData")))
                    .productsData(objectMapper.writeValueAsString(map.get("productsData")))
                    .animationSteps(objectMapper.writeValueAsString(map.get("animationSteps")))
                    .build();
        } catch (Exception e) {
            // Khong nuot loi bang null: JSON hong (thuong do bi cat) can noi len de log/frontend biet ly do.
            throw new IllegalStateException(
                    "Khong parse duoc JSON tu AI (co the bi cat giua chung). Do dai JSON=" + json.length()
                    + ". Loi: " + e.getMessage(), e);
        }
    }

    /**
     * Lay dung 1 JSON object tu response cua model: bo phan reasoning (<think>...</think>),
     * markdown fence va bat ky text nao nam ngoai cap { } ngoai cung.
     * Model reasoning (nemotron) co the boc suy luan trong <think>, ma khoi do co the chua dau { }
     * -> phai bo <think> TRUOC khi tim { } ngoai cung, neu khong bien start/end se sai.
     */
    private String extractJsonObject(String text) {
        // (?s) = dotall: cho . khop ca xuong dong, de bo tron khoi <think> nhieu dong.
        String cleaned = text.replaceAll("(?s)<think>.*?</think>", "")
                .replaceAll("```json\\s*", "")
                .replaceAll("```\\s*", "")
                .trim();
        int start = cleaned.indexOf('{');
        int end = cleaned.lastIndexOf('}');
        if (start >= 0 && end > start) {
            return cleaned.substring(start, end + 1);
        }
        return cleaned;
    }
}
