package com.chemlab.service;

import org.springframework.stereotype.Component;

import java.text.Normalizer;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

/**
 * Doi chieu ten chu de giua giao dien va co so du lieu.
 *
 * Giao dien gui gia tri tieng Anh ("Molecular Geometry") trong khi du lieu mau luu
 * ten tieng Viet ("Hinh hoc phan tu"), nen loc theo chu de tra ve rong. Lop nay tra ve
 * tat ca bien the cua mot chu de de truy van khop du lieu bat ke ngon ngu duoc chon.
 */
@Component
public class TopicResolver {

    /** Cac nhom chu de dong nghia; moi nhom la mot chu de duy nhat o hai ngon ngu. */
    private static final List<Set<String>> SYNONYM_GROUPS = List.of(
            Set.of("Molecular Geometry", "Hình học phân tử"),
            Set.of("Chemical Bonds", "Liên kết hóa học"),
            Set.of("Redox Reactions", "Phản ứng Oxy hóa - Khử", "Phản ứng oxi hóa khử"),
            Set.of("Acid-Base Chemistry", "Hóa học Axit - Bazơ", "Axit - Bazơ"),
            Set.of("Thermochemistry", "Nhiệt hóa học"),
            Set.of("Organic Chemistry", "Hóa học hữu cơ")
    );

    /**
     * Tra ve moi cach viet cua chu de da cho, ke ca chinh no.
     * Neu chu de khong nam trong danh sach dong nghia thi chi tra ve chinh no.
     */
    public List<String> aliasesOf(String topic) {
        if (topic == null || topic.isBlank()) {
            return List.of();
        }
        String key = canonicalize(topic);
        Set<String> aliases = new LinkedHashSet<>();
        aliases.add(topic);
        for (Set<String> group : SYNONYM_GROUPS) {
            boolean matches = group.stream().anyMatch(name -> canonicalize(name).equals(key));
            if (matches) {
                aliases.addAll(group);
            }
        }
        return new ArrayList<>(aliases);
    }

    /**
     * Rut gon chuoi de so sanh: bo dau tieng Viet, dau cau va khoang trang thua,
     * roi chuyen ve chu thuong. Nho vay "Axit-Bazo" va "axit bazo" duoc coi la mot.
     */
    private String canonicalize(String value) {
        String noAccent = Normalizer.normalize(value, Normalizer.Form.NFD)
                .replaceAll("\\p{InCombiningDiacriticalMarks}+", "")
                .replace('đ', 'd')
                .replace('Đ', 'D');
        return noAccent.toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9]+", " ")
                .trim();
    }
}
