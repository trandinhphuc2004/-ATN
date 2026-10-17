package com.chemlab.repository;

import com.chemlab.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    List<User> findByRole(User.Role role);

    /** Hoc sinh cua mot lop. */
    List<User> findByClassRoom_IdOrderByNameAsc(Long classId);

    int countByClassRoom_Id(Long classId);

    @Query("SELECT u FROM User u WHERE " +
           "(:name IS NULL OR LOWER(u.name) LIKE LOWER(CONCAT('%', :name, '%'))) AND " +
           "(:email IS NULL OR LOWER(u.email) LIKE LOWER(CONCAT('%', :email, '%'))) AND " +
           "(:role IS NULL OR u.role = :role) AND " +
           "(:classId IS NULL OR u.classRoom.id = :classId)")
    List<User> searchUsers(@Param("name") String name,
                           @Param("email") String email,
                           @Param("role") User.Role role,
                           @Param("classId") Long classId);
}
