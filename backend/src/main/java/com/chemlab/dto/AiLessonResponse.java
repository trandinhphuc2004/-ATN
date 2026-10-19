package com.chemlab.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Bai hoc do AI sinh ra, KEM video goi y, tra ve cho nguoi dung xem truoc.
 *
 * Chua duoc luu vao co so du lieu: nguoi dung xem xong moi bam "Luu bai hoc".
 * Vi vay day la DTO chu khong phai entity Lesson.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiLessonResponse {

    private String title;

    /** Noi dung bai hoc dang HTML: cac the h2, h3, p, ul, li, table. */
    private String content;

    private String topic;

    private String difficulty;

    /** Video bai giang tim tu YouTube theo tieu de bai hoc. Co the la danh sach rong. */
    private List<VideoDto> videos;
}
