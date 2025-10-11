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
                                // Allow access to static files
                                .requestMatchers("/", "/index.html", "/style.css", "/script.js", "/fonts/**").permitAll()

                                // Allow access to login/signup
                                .requestMatchers("/api/players/login", "/api/players/create").permitAll()

                                // REPLACE your old task rules with this single, more general one
                                .requestMatchers("/api/tasks/**").permitAll()

                                // Allow access to the H2 console
                                .requestMatchers("/h2-console/**").permitAll()

                                // All other requests should be authenticated
                                .anyRequest().authenticated()
                );

        return http.build();
    }
}