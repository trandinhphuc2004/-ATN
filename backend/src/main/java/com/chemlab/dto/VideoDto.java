package com.chemlab.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Mot video YouTube goi y cho bai hoc hoac phan ung.
 * videoId dung de nhung iframe: https://www.youtube.com/embed/{videoId}
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VideoDto {

    /** Ma video YouTube, vi du "dQw4w9WgXcQ". Dung truc tiep trong URL nhung iframe. */
    private String videoId;

    /** Tieu de video. */
    private String title;

    /** Ten kenh dang video. */
    private String channelTitle;

    /** Anh dai dien video (thumbnail chat luong trung binh). */
    private String thumbnailUrl;

    /** Mo ta ngan cua video, da cat bot cho gon. */
    private String description;
}
