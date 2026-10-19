package com.chemlab.service;

import com.chemlab.config.HttpClients;
import com.chemlab.dto.ChatRequest;
import com.chemlab.dto.ChatResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;
import java.util.Map;

@Service
public class AiChatService {

    private final WebClient webClient;
    private final String apiKey;
    private final String model;

    private static final String SYSTEM_PROMPT = """
            Bạn là một gia sư hóa học cho học sinh trung học phổ thông.
            Hãy giải thích các khái niệm một cách rõ ràng và đơn giản.
            Sử dụng các ví dụ khi có thể.
            Tập trung vào cấu trúc phân tử, liên kết hóa học và phản ứng.
            Nếu được hỏi về vấn đề không liên quan đến hóa học, hãy lịch sự dẫn dắt lại chủ đề hóa học.
            QUAN TRỌNG: Luôn luôn trả lời bằng tiếng Việt.
            Sử dụng định dạng **chữ đậm** cho các từ khóa quan trọng.
            """;

    public AiChatService(
            @Value("${ai.api.url}") String apiUrl,
            @Value("${ai.api.key}") String apiKey,
            @Value("${ai.api.model}") String model) {
        this.webClient = WebClient.builder().baseUrl(apiUrl)
                .clientConnector(new ReactorClientHttpConnector(HttpClients.create()))
                .build();
        this.apiKey = apiKey;
        this.model = model;
    }

    public ChatResponse chat(ChatRequest request) {
        try {
            // OpenRouter dung chuan OpenAI: tach system prompt va user message thanh 2 "messages".
            Map<String, Object> body = Map.of(
                    "model", model,
                    "messages", List.of(
                            Map.of("role", "system", "content", SYSTEM_PROMPT),
                            Map.of("role", "user", "content", request.getQuestion())
                    ),
                    "temperature", 0.7,
                    "max_tokens", 500
            );

            Map response = webClient.post()
                    .uri("/chat/completions")
                    .header("Authorization", "Bearer " + apiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(body)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();

            if (response != null && response.containsKey("choices")) {
                List<Map<String, Object>> choices = (List<Map<String, Object>>) response.get("choices");
                if (!choices.isEmpty()) {
                    Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
                    String text = (String) message.get("content");
                    if (text != null) {
                        return new ChatResponse(text);
                    }
                }
            }
            return new ChatResponse("Sorry, I couldn't process your question. Please try again.");
        } catch (Exception e) {
            return getFallbackResponse(request.getQuestion());
        }
    }

    private ChatResponse getFallbackResponse(String question) {
        String q = question.toLowerCase();

        if (q.contains("h2o") || q.contains("nước")) {
            return new ChatResponse(
                    "Nước (H₂O) có **hình học phân tử gấp khúc** với góc liên kết khoảng **104.5°**. " +
                    "Nguyên tử oxy có hai cặp electron liên kết và hai cặp electron chưa liên kết. " +
                    "Các cặp electron chưa liên kết đẩy các nguyên tử hydro lại gần nhau hơn, tạo ra hình dạng gấp khúc. " +
                    "Nước là một phân tử **phân cực** do cấu trúc bất đối xứng này.");
        } else if (q.contains("nh3") || q.contains("ammonia")) {
            return new ChatResponse(
                    "Ammonia (NH₃) có hình dạng **tháp tam giác**. Nguyên tử nitơ liên kết với ba nguyên tử hydro " +
                    "và có một cặp electron chưa liên kết. Góc liên kết vào khoảng **107°**, nhỏ hơn một chút so với " +
                    "góc tứ diện 109.5° do sự đẩy của cặp electron chưa liên kết. NH₃ là một phân tử **phân cực**.");
        } else if (q.contains("ch4") || q.contains("methane")) {
            return new ChatResponse(
                    "Methane (CH₄) có **hình học tứ diện** với các góc liên kết là **109.5°**. " +
                    "Nguyên tử cacbon ở trung tâm liên kết với bốn nguyên tử hydro. " +
                    "Vì cả bốn liên kết đều giống hệt nhau và được sắp xếp đối xứng, methane là một phân tử **không phân cực**.");
        } else if (q.contains("co2") || q.contains("carbon dioxide")) {
            return new ChatResponse(
                    "Carbon dioxide (CO₂) có **hình học phân tử đường thẳng** với góc liên kết là **180°**. " +
                    "Nguyên tử cacbon tạo liên kết đôi với mỗi nguyên tử oxy. " +
                    "Mặc dù có các liên kết C=O phân cực, nhưng phân tử này **không phân cực** vì các lưỡng cực liên kết triệt tiêu lẫn nhau.");
        } else if (q.contains("covalent") || q.contains("cộng hóa trị")) {
            return new ChatResponse(
                    "**Liên kết cộng hóa trị** được hình thành khi hai nguyên tử chia sẻ một hoặc nhiều cặp electron. " +
                    "Điều này thường xảy ra giữa các nguyên tử phi kim. Các loại bao gồm: " +
                    "**Liên kết đơn** (1 cặp dùng chung, ví dụ: H-H), " +
                    "**Liên kết đôi** (2 cặp dùng chung, ví dụ: O=O), " +
                    "**Liên kết ba** (3 cặp dùng chung, ví dụ: N≡N). " +
                    "Liên kết cộng hóa trị có thể là **phân cực** (chia sẻ không đều) hoặc **không phân cực** (chia sẻ đều).");
        } else if (q.contains("ionic") || q.contains("ion")) {
            return new ChatResponse(
                    "**Liên kết ion** được hình thành khi một nguyên tử nhường electron cho nguyên tử khác, tạo ra các ion. " +
                    "Điều này thường xảy ra giữa kim loại và phi kim. " +
                    "Kim loại mất electron để trở thành **cation (+)**, trong khi phi kim nhận electron để trở thành **anion (-)**. " +
                    "Ví dụ: **NaCl** - natri chuyển một electron cho clo.");
        } else {
            return new ChatResponse(
                    "Đó là một câu hỏi hóa học tuyệt vời! Trong chế độ demo này, tôi có thể trả lời các câu hỏi về: " +
                    "**H₂O (nước)**, **NH₃ (ammonia)**, **CH₄ (methane)**, **CO₂ (carbon dioxide)**, " +
                    "**liên kết cộng hóa trị**, và **liên kết ion**. " +
                    "Vui lòng định cấu hình khóa API AI để có đầy đủ chức năng.");
        }
    }
}
