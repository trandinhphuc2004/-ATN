package com.chemlab.service;

import com.chemlab.config.HttpClients;
import com.chemlab.dto.VideoDto;
import com.fasterxml.jackson.databind.JsonNode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.util.UriComponentsBuilder;
import reactor.netty.http.client.HttpClient;

import java.time.Duration;
import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Goi YouTube Data API v3 de tim video bai giang lien quan den bai hoc / phan ung.
 *
 * Vi sao khong de AI tu sinh ma video: model se bia ra ma video khong ton tai,
 * iframe nhung vao se bao loi. Chi API cua YouTube tra ve ma video that.
 *
 * Ket qua duoc cache trong bo nho theo tu khoa de tiet kiem quota:
 * YouTube Data API cho 10.000 don vi quota moi ngay, moi lan search ton 100 don vi
 * (tuong duong 100 lan search/ngay neu khong cache).
 */
@Service
public class YouTubeService {

    private static final Logger log = LoggerFactory.getLogger(YouTubeService.class);

    private static final String SEARCH_URL = "https://www.googleapis.com/youtube/v3/search";

    /** So video toi da tra ve cho moi truy van. */
    private static final int MAX_RESULTS = 4;

    /** Gioi han so tu khoa duoc cache, tranh cache phinh vo han. */
    private static final int CACHE_LIMIT = 200;

    private final WebClient webClient;
    private final String apiKey;

    /**
     * Cache tu khoa -> danh sach video. Dung LinkedHashMap dang LRU:
     * khi vuot CACHE_LIMIT thi xoa muc cu nhat.
     */
    private final Map<String, List<VideoDto>> cache = Collections.synchronizedMap(
            new LinkedHashMap<String, List<VideoDto>>(16, 0.75f, true) {
                @Override
                protected boolean removeEldestEntry(Map.Entry<String, List<VideoDto>> eldest) {
                    return size() > CACHE_LIMIT;
                }
            });

    public YouTubeService(@Value("${youtube.api.key:}") String apiKey) {
        // Timeout 15s: YouTube API thuong tra ve duoi 1s. Neu treo lau hon thi
        // coi nhu that bai va tra ve danh sach rong, khong de nguoi dung cho.
        HttpClient httpClient = HttpClients.create().responseTimeout(Duration.ofSeconds(15));
        this.webClient = WebClient.builder()
                .clientConnector(new ReactorClientHttpConnector(httpClient))
                .build();
        this.apiKey = apiKey == null ? "" : apiKey.trim();
    }

    /** Da cau hinh API key chua. Frontend dung de biet co nen hien khu vuc video hay khong. */
    public boolean isEnabled() {
        return !apiKey.isEmpty();
    }

    /**
     * Tim video bai giang theo tu khoa.
     *
     * @param keyword tu khoa tim kiem, vi du "cau truc phan tu nuoc H2O hoa hoc"
     * @return danh sach video, hoac danh sach rong neu chua co API key / goi API that bai.
     *         Khong nem exception: thieu video khong nen lam vo trang bai hoc.
     */
    public List<VideoDto> search(String keyword) {
        if (keyword == null || keyword.isBlank()) {
            return List.of();
        }
        if (!isEnabled()) {
            log.debug("Chua cau hinh youtube.api.key, bo qua tim video");
            return List.of();
        }

        String cacheKey = keyword.trim().toLowerCase();
        List<VideoDto> cached = cache.get(cacheKey);
        if (cached != null) {
            return cached;
        }

        try {
            // videoEmbeddable=true: chi lay video CHO PHEP nhung. Khong co tham so nay,
            // mot so video se hien "Video unavailable" trong iframe.
            // relevanceLanguage=vi: uu tien video tieng Viet.
            String url = UriComponentsBuilder.fromUriString(SEARCH_URL)
                    .queryParam("part", "snippet")
                    .queryParam("q", keyword)
                    .queryParam("type", "video")
                    .queryParam("videoEmbeddable", "true")
                    .queryParam("relevanceLanguage", "vi")
                    .queryParam("safeSearch", "strict")
                    .queryParam("maxResults", MAX_RESULTS)
                    .queryParam("key", apiKey)
                    .build()
                    .toUriString();

            JsonNode root = webClient.get()
                    .uri(url)
                    .retrieve()
                    .bodyToMono(JsonNode.class)
                    .block();

            List<VideoDto> videos = parseResponse(root);
            cache.put(cacheKey, videos);
            return videos;

        } catch (Exception e) {
            // Tra ve rong thay vi nem loi: trang bai hoc van xem duoc binh thuong.
            log.warn("Tim video YouTube that bai voi tu khoa='{}': {}", keyword, e.getMessage());
            return List.of();
        }
    }

    private List<VideoDto> parseResponse(JsonNode root) {
        List<VideoDto> videos = new ArrayList<>();
        if (root == null) {
            return videos;
        }
        JsonNode items = root.path("items");
        for (JsonNode item : items) {
            String videoId = item.path("id").path("videoId").asText(null);
            if (videoId == null || videoId.isBlank()) {
                continue;
            }
            JsonNode snippet = item.path("snippet");
            videos.add(VideoDto.builder()
                    .videoId(videoId)
                    .title(snippet.path("title").asText(""))
                    .channelTitle(snippet.path("channelTitle").asText(""))
                    .thumbnailUrl(snippet.path("thumbnails").path("medium").path("url").asText(""))
                    .description(truncate(snippet.path("description").asText(""), 160))
                    .build());
        }
        return videos;
    }

    private String truncate(String text, int max) {
        if (text == null) {
            return "";
        }
        return text.length() <= max ? text : text.substring(0, max) + "...";
    }
}
