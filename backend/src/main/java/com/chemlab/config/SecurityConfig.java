package com.chemlab.config;

import com.chemlab.security.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // Public auth endpoint. Khong co dang ky cong khai: chi ADMIN tao tai khoan.
                .requestMatchers("/api/auth/login").permitAll()
                // Public read-only endpoints (thu vien tra cuu). Bai hoc KHONG con cong khai:
                // hoc sinh chi xem bai hoc da gan cho lop cua minh nen phai dang nhap.
                .requestMatchers(HttpMethod.GET, "/api/molecules/**", "/api/reactions/**").permitAll()
                // Public: video goi y tu YouTube (chi doc, khong chua du lieu nguoi dung)
                .requestMatchers(HttpMethod.GET, "/api/videos/**").permitAll()
                // Admin-only: user management, class management
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                // Teacher/Admin: thong ke theo lop (kiem tra phan cong lop trong TeacherDashboardService)
                .requestMatchers("/api/teacher/**").hasAnyRole("ADMIN", "TEACHER")
                // Teacher/Admin: tao, bat/tat, xoa de thi va xem de minh tao
                .requestMatchers(HttpMethod.POST, "/api/exams").hasAnyRole("ADMIN", "TEACHER")
                .requestMatchers(HttpMethod.GET, "/api/exams/my").hasAnyRole("ADMIN", "TEACHER")
                .requestMatchers(HttpMethod.GET, "/api/exams/all").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/exams/*/toggle").hasAnyRole("ADMIN", "TEACHER")
                .requestMatchers(HttpMethod.DELETE, "/api/exams/*").hasAnyRole("ADMIN", "TEACHER")
                // Admin/Teacher: molecule CRUD
                .requestMatchers(HttpMethod.POST, "/api/molecules/**").hasAnyRole("ADMIN", "TEACHER")
                .requestMatchers(HttpMethod.PUT, "/api/molecules/**").hasAnyRole("ADMIN", "TEACHER")
                .requestMatchers(HttpMethod.DELETE, "/api/molecules/**").hasAnyRole("ADMIN", "TEACHER")
                // Admin/Teacher: AI chua de thi (chi giao vien/quan tri duoc tai de len)
                .requestMatchers("/api/exam-ai/**").hasAnyRole("ADMIN", "TEACHER")
                // Admin/Teacher: sinh bai hoc bang AI (cung quyen voi tao bai hoc thong thuong)
                .requestMatchers(HttpMethod.POST, "/api/ai/generate-lesson").hasAnyRole("ADMIN", "TEACHER")
                // Admin/Teacher: lesson CRUD
                .requestMatchers(HttpMethod.POST, "/api/lessons/**").hasAnyRole("ADMIN", "TEACHER")
                .requestMatchers(HttpMethod.PUT, "/api/lessons/**").hasAnyRole("ADMIN", "TEACHER")
                .requestMatchers(HttpMethod.DELETE, "/api/lessons/**").hasAnyRole("ADMIN", "TEACHER")
                // Admin/Teacher: quiz question create
                .requestMatchers(HttpMethod.POST, "/api/quiz/questions").hasAnyRole("ADMIN", "TEACHER")
                // Admin-only: quiz question delete
                .requestMatchers(HttpMethod.DELETE, "/api/quiz/questions/**").hasRole("ADMIN")
                // H2 console (dev)
                .requestMatchers("/h2-console/**").permitAll()
                // All other requests require authentication
                .anyRequest().authenticated()
            )
            .headers(headers -> headers.frameOptions(frame -> frame.sameOrigin()))
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}
