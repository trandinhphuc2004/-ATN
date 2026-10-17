package com.chemlab.repository;

import com.chemlab.entity.Question;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;

public interface QuestionRepository extends JpaRepository<Question, Long> {
    List<Question> findByTopic(String topic);
    List<Question> findByDifficulty(String difficulty);

    /** Loc theo nhieu cach viet cua cung mot chu de (tieng Viet lan tieng Anh). */
    List<Question> findByTopicIn(Collection<String> topics);
}
