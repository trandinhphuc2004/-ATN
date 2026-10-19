package com.chemlab.service;

import com.chemlab.config.HttpClients;
import com.chemlab.dto.AiQuestionRequest;
import com.chemlab.dto.ChatResponse;
import com.chemlab.entity.Question;
import com.chemlab.repository.QuestionRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.*;

@Service
public class AiQuestionGeneratorService {

    private final WebClient webClient;
    private final String apiKey;
    private final String model;
    private final QuestionRepository questionRepository;

    public AiQuestionGeneratorService(
            @Value("${ai.api.url}") String apiUrl,
            @Value("${ai.api.key}") String apiKey,
            @Value("${ai.api.model}") String model,
            QuestionRepository questionRepository) {
        this.webClient = WebClient.builder().baseUrl(apiUrl)
                .clientConnector(new ReactorClientHttpConnector(HttpClients.create()))
                .build();
        this.apiKey = apiKey;
        this.model = model;
        this.questionRepository = questionRepository;
    }

    public List<Question> generateQuestions(AiQuestionRequest request) {
        try {
            String prompt = "You are a chemistry question generator. Return ONLY valid JSON array.\n\n" + buildPrompt(request);

            // OpenRouter dung chuan OpenAI: endpoint /chat/completions, body co "messages".
            Map<String, Object> body = Map.of(
                    "model", model,
                    "messages", List.of(
                            Map.of("role", "user", "content", prompt)
                    ),
                    "temperature", 0.8,
                    "max_tokens", 2000
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
                        return parseAiQuestions(text, request);
                    }
                }
            }
        } catch (Exception e) {
            // fallback
        }

        return generateFallbackQuestions(request);
    }

    private String buildPrompt(AiQuestionRequest request) {
        return String.format("""
                Generate %d multiple choice chemistry questions for high school students.
                Topic: %s
                Difficulty: %s

                IMPORTANT: Write the question text, all 4 options and the explanation in
                VIETNAMESE. Keep chemical formulas and element symbols unchanged.
                The "correctAnswer" field must stay one of the letters A, B, C or D.

                For each question, provide:
                - question text
                - 4 options (A, B, C, D)
                - correct answer (A, B, C, or D)
                - brief explanation
                
                Return as JSON array:
                [{"question":"...","optionA":"...","optionB":"...","optionC":"...","optionD":"...","correctAnswer":"A","explanation":"..."}]
                """, request.getCount(), request.getTopic(), request.getDifficulty());
    }

    private List<Question> parseAiQuestions(String content, AiQuestionRequest request) {
        // Simple JSON parsing - in production, use Jackson ObjectMapper
        List<Question> questions = new ArrayList<>();
        try {
            // Strip markdown code blocks + chi lay tu '[' den ']' cuoi cung (bo text thua model them).
            content = content.replaceAll("```json\\s*", "").replaceAll("```\\s*", "").trim();
            int start = content.indexOf('[');
            int end = content.lastIndexOf(']');
            if (start >= 0 && end > start) {
                content = content.substring(start, end + 1);
            }

            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            List<Map<String, String>> parsed = mapper.readValue(content,
                    mapper.getTypeFactory().constructCollectionType(List.class, Map.class));

            for (Map<String, String> q : parsed) {
                questions.add(Question.builder()
                        .question(q.getOrDefault("question", ""))
                        .optionA(q.getOrDefault("optionA", ""))
                        .optionB(q.getOrDefault("optionB", ""))
                        .optionC(q.getOrDefault("optionC", ""))
                        .optionD(q.getOrDefault("optionD", ""))
                        .correctAnswer(q.getOrDefault("correctAnswer", "A"))
                        .topic(request.getTopic())
                        .difficulty(request.getDifficulty())
                        .explanation(q.getOrDefault("explanation", ""))
                        .build());
            }
        } catch (Exception e) {
            return generateFallbackQuestions(request);
        }
        return questions;
    }

    private List<Question> generateFallbackQuestions(AiQuestionRequest request) {
        List<Question> questions = new ArrayList<>();
        String topic = request.getTopic().toLowerCase();

        if (topic.contains("bond") || topic.contains("chemical bond")) {
            questions.add(createQuestion("What type of bond involves the sharing of electrons?",
                    "Ionic bond", "Covalent bond", "Metallic bond", "Hydrogen bond", "B",
                    "Chemical Bonds", request.getDifficulty()));
            questions.add(createQuestion("Which of the following is an example of an ionic compound?",
                    "H₂O", "CO₂", "NaCl", "CH₄", "C",
                    "Chemical Bonds", request.getDifficulty()));
            questions.add(createQuestion("What determines the type of bond formed between two atoms?",
                    "Atomic size", "Electronegativity difference", "Number of protons", "Atomic mass", "B",
                    "Chemical Bonds", request.getDifficulty()));
            questions.add(createQuestion("A polar covalent bond is formed when:",
                    "Electrons are transferred", "Electrons are shared equally",
                    "Electrons are shared unequally", "No electrons are involved", "C",
                    "Chemical Bonds", request.getDifficulty()));
            questions.add(createQuestion("How many covalent bonds can carbon typically form?",
                    "1", "2", "3", "4", "D",
                    "Chemical Bonds", request.getDifficulty()));
        } else if (topic.contains("geometry") || topic.contains("molecular")) {
            questions.add(createQuestion("What is the shape of a molecule with 4 bonding pairs and 0 lone pairs?",
                    "Linear", "Trigonal planar", "Tetrahedral", "Bent", "C",
                    "Molecular Geometry", request.getDifficulty()));
            questions.add(createQuestion("VSEPR theory is used to predict:",
                    "Bond energy", "Molecular shape", "Reaction rate", "Boiling point", "B",
                    "Molecular Geometry", request.getDifficulty()));
            questions.add(createQuestion("What angle is found in a trigonal planar molecule?",
                    "90°", "104.5°", "109.5°", "120°", "D",
                    "Molecular Geometry", request.getDifficulty()));
            questions.add(createQuestion("A molecule with 3 bonding pairs and 1 lone pair has what shape?",
                    "Tetrahedral", "Trigonal pyramidal", "Trigonal planar", "Bent", "B",
                    "Molecular Geometry", request.getDifficulty()));
            questions.add(createQuestion("Which hybridization gives a linear geometry?",
                    "sp", "sp²", "sp³", "sp³d", "A",
                    "Molecular Geometry", request.getDifficulty()));
        } else if (topic.contains("redox") || topic.contains("oxidation")) {
            questions.add(createQuestion("In a redox reaction, the substance that loses electrons is:",
                    "Reduced", "Oxidized", "Neutralized", "Catalyzed", "B",
                    "Redox Reactions", request.getDifficulty()));
            questions.add(createQuestion("What is the oxidation state of oxygen in most compounds?",
                    "-1", "-2", "+2", "0", "B",
                    "Redox Reactions", request.getDifficulty()));
            questions.add(createQuestion("A reducing agent:",
                    "Gains electrons", "Loses electrons", "Gains protons", "Loses protons", "B",
                    "Redox Reactions", request.getDifficulty()));
            questions.add(createQuestion("In the reaction 2Na + Cl₂ → 2NaCl, sodium is:",
                    "Reduced", "Oxidized", "Neither", "Both", "B",
                    "Redox Reactions", request.getDifficulty()));
            questions.add(createQuestion("What is the oxidation number of H in H₂O?",
                    "0", "-1", "+1", "+2", "C",
                    "Redox Reactions", request.getDifficulty()));
        } else {
            questions.add(createQuestion("What is the atomic number of Carbon?",
                    "4", "6", "8", "12", "B",
                    request.getTopic(), request.getDifficulty()));
            questions.add(createQuestion("Which element has the symbol 'Na'?",
                    "Nitrogen", "Neon", "Sodium", "Nickel", "C",
                    request.getTopic(), request.getDifficulty()));
            questions.add(createQuestion("What is Avogadro's number?",
                    "6.022 × 10²³", "3.14 × 10⁸", "1.602 × 10⁻¹⁹", "9.109 × 10⁻³¹", "A",
                    request.getTopic(), request.getDifficulty()));
            questions.add(createQuestion("The pH of a neutral solution is:",
                    "0", "7", "14", "1", "B",
                    request.getTopic(), request.getDifficulty()));
            questions.add(createQuestion("Which state of matter has a definite shape and volume?",
                    "Gas", "Liquid", "Plasma", "Solid", "D",
                    request.getTopic(), request.getDifficulty()));
        }

        int count = Math.min(request.getCount(), questions.size());
        return questions.subList(0, count);
    }

    private Question createQuestion(String q, String a, String b, String c, String d,
                                     String answer, String topic, String difficulty) {
        return Question.builder()
                .question(q)
                .optionA(a)
                .optionB(b)
                .optionC(c)
                .optionD(d)
                .correctAnswer(answer)
                .topic(topic)
                .difficulty(difficulty)
                .build();
    }
}
