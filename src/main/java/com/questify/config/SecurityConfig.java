package com.questify.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .headers(headers -> headers.frameOptions(frameOptions -> frameOptions.disable()))

                .authorizeHttpRequests(authorizeRequests ->
                        authorizeRequests
                                // Allow access to static files, the main page, and our API endpoints
                                .requestMatchers("/", "/index.html", "/style.css", "/script.js").permitAll()
                                .requestMatchers("/fonts/**").permitAll() // Allow fonts
                                .requestMatchers("/api/players/login", "/api/players/create").permitAll()
                                .requestMatchers("/h2-console/**").permitAll()

                                // All other requests should be authenticated
                                .anyRequest().authenticated()
                );

        return http.build();
    }
}