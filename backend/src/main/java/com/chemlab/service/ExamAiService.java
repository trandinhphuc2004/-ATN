package com.chemlab.service;

import com.chemlab.config.HttpClients;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Base64;
import java.util.List;
import java.util.Map;

@Service
public class ExamAiService {

    // Anh de thi thuong la file chup tu dien thoai -> gioi han dung luong de tranh
    // gui request qua lon len OpenRouter (bi tu choi hoac rat cham).
    private static final long MAX_IMAGE_BYTES = 8L * 1024 * 1024; // 8MB

    private final WebClient webClient;
    private final String apiKey;
    private final List<String> visionModels;
    private final ObjectMapper objectMapper;

    public ExamAiService(
            @Value("${ai.api.url}") String apiUrl,
            @Value("${ai.api.key}") String apiKey,
            @Value("${ai.api.vision-model:}") String visionModel,
            ObjectMapper objectMapper) {
        // WebClient mac dinh gioi han buffer 256KB, trong khi anh base64 co the vai MB
        // -> phai nang gioi han len, neu khong se loi "DataBufferLimitException".
        this.webClient = WebClient.builder()
                .baseUrl(apiUrl)
                .clientConnector(new ReactorClientHttpConnector(HttpClients.create()))
                .codecs(c -> c.defaultCodecs().maxInMemorySize(16 * 1024 * 1024))
                .build();
        this.apiKey = apiKey;
        this.visionModels = parseModels(visionModel);
        this.objectMapper = objectMapper;
    }

    /** Tach chuoi "modelA,modelB" thanh danh sach, bo phan tu rong. */
    private static List<String> parseModels(String raw) {
        List<String> out = new ArrayList<>();
        if (raw != null && !raw.isBlank()) {
            for (String m : Arrays.asList(raw.split(","))) {
                String t = m.trim();
                if (!t.isEmpty()) {
                    out.add(t);
                }
            }
        }
        return out;
    }

    public String analyzeExam(MultipartFile file) {
        // Tinh nang doc anh de thi CAN model vision. Model text thuong khong doc duoc anh.
        if (visionModels.isEmpty()) {
            return "Tính năng phân tích ảnh đề thi chưa được cấu hình. " +
                    "Vui lòng đặt `ai.api.vision-model` (hoặc biến môi trường OPENROUTER_VISION_MODELS) " +
                    "sang một hoặc nhiều model có khả năng đọc ảnh trên OpenRouter, " +
                    "ví dụ: google/gemma-4-31b-it:free";
        }

        // Kiem tra dinh dang / dung luong TRUOC khi goi API de bao loi cho nguoi dung som.
        String mimeType = file.getContentType();
        if (mimeType == null || !mimeType.startsWith("image/")) {
            return "Tệp tải lên không phải là ảnh. Vui lòng chọn ảnh đề thi (JPG, PNG).";
        }
        if (file.getSize() > MAX_IMAGE_BYTES) {
            return String.format(
                    "Ảnh đề thi quá lớn (%.1f MB). Vui lòng dùng ảnh nhỏ hơn %d MB.",
                    file.getSize() / 1024.0 / 1024.0, MAX_IMAGE_BYTES / 1024 / 1024);
        }

        String prompt = "Bạn là một giáo viên Hóa học xuất sắc. Dưới đây là hình ảnh/nội dung của một đề thi Hóa. " +
                "Nhiệm vụ của bạn là:\n" +
                "1. Đọc và nhận diện các câu hỏi trong đề thi.\n" +
                "2. Giải chi tiết từng câu hỏi một cách dễ hiểu, có giải thích các bước hoặc các kiến thức liên quan.\n" +
                "3. Đưa ra đáp án cuối cùng cho mỗi câu.\n" +
                "Trình bày kết quả rõ ràng, sử dụng markdown để phân chia từng câu.";

        String dataUri;
        try {
            dataUri = "data:" + mimeType + ";base64,"
                    + Base64.getEncoder().encodeToString(file.getBytes());
        } catch (Exception e) {
            return "Không đọc được tệp ảnh đề thi: " + e.getMessage();
        }

        // Thu lan luot cac model: model mien phi hay bi 429 (dung chung nhieu nguoi)
        // hoac 402 (het credit) -> tu dong lui ve model tiep theo thay vi bao loi ngay.
        String lastError = null;
        for (String model : visionModels) {
            try {
                Map<String, Object> body = Map.of(
                        "model", model,
                        "messages", List.of(
                                Map.of("role", "user", "content", List.of(
                                        Map.of("type", "text", "text", prompt),
                                        Map.of("type", "image_url", "image_url", Map.of("url", dataUri))
                                ))
                        ),
                        "temperature", 0.7,
                        "max_tokens", 8000
                );

                @SuppressWarnings("unchecked")
                Map<String, Object> response = webClient.post()
                        .uri("/chat/completions")
                        .header("Authorization", "Bearer " + apiKey)
                        .contentType(MediaType.APPLICATION_JSON)
                        .bodyValue(body)
                        .retrieve()
                        .bodyToMono(Map.class)
                        .block();

                String text = extractContent(response);
                if (text != null && !text.isBlank()) {
                    return text;
                }
                lastError = "model " + model + " tra ve noi dung rong";
            } catch (Exception e) {
                // Ghi lai loi roi thu model ke tiep.
                lastError = model + ": " + e.getMessage();
                System.err.println("[ExamAiService] " + lastError);
            }
        }

        return "Không phân tích được đề thi sau khi thử " + visionModels.size()
                + " model. Lỗi gần nhất: " + lastError;
    }

    /** Lay phan noi dung tra loi tu cau truc JSON chuan cua OpenAI/OpenRouter. */
    @SuppressWarnings("unchecked")
    private String extractContent(Map<String, Object> response) {
        if (response == null) {
            return null;
        }
        Object choicesObj = response.get("choices");
        if (!(choicesObj instanceof List)) {
            return null;
        }
        List<Map<String, Object>> choices = (List<Map<String, Object>>) choicesObj;
        if (choices.isEmpty()) {
            return null;
        }
        Object messageObj = choices.get(0).get("message");
        if (!(messageObj instanceof Map)) {
            return null;
        }
        Object content = ((Map<String, Object>) messageObj).get("content");
        return content instanceof String ? (String) content : null;
    }
}
