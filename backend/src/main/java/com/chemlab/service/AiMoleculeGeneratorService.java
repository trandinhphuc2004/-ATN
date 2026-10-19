package com.chemlab.service;

import com.chemlab.config.HttpClients;
import com.chemlab.dto.AiMoleculeRequest;
import com.chemlab.entity.Molecule;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;
import java.util.Map;

@Service
public class AiMoleculeGeneratorService {

    private final WebClient webClient;
    private final String apiKey;
    private final String model;
    private final ObjectMapper objectMapper;

    public AiMoleculeGeneratorService(
            @Value("${ai.api.url}") String apiUrl,
            @Value("${ai.api.key}") String apiKey,
            @Value("${ai.api.model}") String model,
            ObjectMapper objectMapper) {
        this.webClient = WebClient.builder().baseUrl(apiUrl)
                .clientConnector(new ReactorClientHttpConnector(HttpClients.create()))
                .build();
        this.apiKey = apiKey;
        this.model = model;
        this.objectMapper = objectMapper;
    }

    public Molecule generateMolecule(AiMoleculeRequest request) {
        String prompt = buildPrompt(request.getQuery());

        // NVIDIA NIM dung chuan OpenAI: endpoint /chat/completions, body co "messages".
        // response_format json_object: ep model tra JSON hop le (tranh loi Jackson parse).
        Map<String, Object> body = Map.of(
                "model", model,
                "messages", List.of(
                        Map.of("role", "user", "content", prompt)
                ),
                "temperature", 0.7,
                "max_tokens", 2000,
                "response_format", Map.of("type", "json_object")
        );

        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> response = webClient.post()
                    .uri("/chat/completions")
                    .header("Authorization", "Bearer " + apiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(body)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();

            if (response != null && response.containsKey("choices")) {
                @SuppressWarnings("unchecked")
                List<Map<String, Object>> choices = (List<Map<String, Object>>) response.get("choices");
                if (!choices.isEmpty()) {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
                    String text = (String) message.get("content");
                    if (text != null) {
                        return parseMoleculeJson(text);
                    }
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        return null;
    }

    private String buildPrompt(String query) {
        return String.format("""
                You are a structural chemistry expert.
                Task: Generate 3D coordinate data for the molecule: "%s".
                
                Requirements:
                1. Provide the molecule's formal name and chemical formula.
                2. List all atoms with their elements (H, C, N, O, etc.) and 3D coordinates (x, y, z in Angstroms).
                3. List all chemical bonds between atoms with 'from' index, 'to' index (0-indexed), and bond 'order' (1, 2, or 3).
                4. Provide a brief, scientifically accurate description (in Vietnamese).
                
                Return ONLY valid JSON.
                Example structure:
                {
                  "name": "Methane",
                  "formula": "CH4",
                  "description": "Metan là hydrocacbon đơn giản nhất...",
                  "atomsData": "[{\\"element\\": \\"C\\", \\"x\\": 0.0, \\"y\\": 0.0, \\"z\\": 0.0}, ...]",
                  "bondsData": "[{\\"from\\": 0, \\"to\\": 1, \\"order\\": 1}, ...]"
                }
                Note: atomsData and bondsData must be JSON strings of arrays.
                """, query);
    }

    private Molecule parseMoleculeJson(String text) {
        try {
            String json = extractJsonObject(text);
            @SuppressWarnings("unchecked")
            Map<String, Object> map = objectMapper.readValue(json, Map.class);

            Molecule molecule = new Molecule();
            molecule.setName((String) map.get("name"));
            molecule.setFormula((String) map.get("formula"));
            molecule.setDescription((String) map.get("description"));
            
            Object atoms = map.get("atomsData");
            if (atoms instanceof String) {
                molecule.setAtomsData((String) atoms);
            } else {
                molecule.setAtomsData(objectMapper.writeValueAsString(atoms));
            }

            Object bonds = map.get("bondsData");
            if (bonds instanceof String) {
                molecule.setBondsData((String) bonds);
            } else {
                molecule.setBondsData(objectMapper.writeValueAsString(bonds));
            }

            return molecule;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    /**
     * Lay dung 1 JSON object tu response cua model: bo markdown fence va text thua ngoai cap { }.
     */
    private String extractJsonObject(String text) {
        String cleaned = text.replaceAll("```json\\s*", "").replaceAll("```\\s*", "").trim();
        int start = cleaned.indexOf('{');
        int end = cleaned.lastIndexOf('}');
        if (start >= 0 && end > start) {
            return cleaned.substring(start, end + 1);
        }
        return cleaned;
    }
}
