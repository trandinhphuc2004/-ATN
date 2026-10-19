package com.chemlab.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * Yeu cau nho AI sinh mot bai hoc. Nguoi dung chi can nhap tieu de,
 * cac truong con lai co gia tri mac dinh de form gon nhat co the.
 */
@Data
public class AiLessonRequest {

    /** Tieu de bai hoc, vi du "Cau truc phan tu nuoc" hoac "Phan ung oxi hoa khu". */
    @NotBlank
    private String title;

    /** Do kho: EASY, MEDIUM, HARD. AI dieu chinh do sau kien thuc theo muc nay. */
    private String difficulty = "MEDIUM";

    /**
     * Chu de de nhom bai hoc, vi du "Hinh hoc phan tu".
     * De trong thi AI tu suy ra chu de tu tieu de.
     */
    private String topic;
}
