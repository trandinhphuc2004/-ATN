package com.chemlab.dto;

import lombok.Data;
import java.util.ArrayList;
import java.util.List;

/** Danh sach id dung khi quan tri vien gan hoc sinh / giao vien / bai hoc / de thi vao lop. */
@Data
public class IdListRequest {
    private List<Long> ids = new ArrayList<>();
}
