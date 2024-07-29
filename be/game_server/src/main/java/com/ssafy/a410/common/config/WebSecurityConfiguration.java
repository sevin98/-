package com.ssafy.a410.common.config;

import com.ssafy.a410.common.filter.HTTPJWTAuthFilter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import java.util.List;


@Slf4j
@EnableWebSecurity
@Configuration
public class WebSecurityConfiguration {
    // 로그인 하지 않아도 접근 가능한 경로
    private final String[] anonymousAllowedPaths = {
            // CommonController
            "/",
            // AuthController
            "/api/auth/guest/sign-up",
    };

    private final String allowedOrigin;

    public WebSecurityConfiguration(@Value("${security.allowed-origin}") String allowedOrigin) {
        this.allowedOrigin = allowedOrigin;
    }


    @Bean
    public SecurityFilterChain filterChain(HttpSecurity security) throws Exception {
        security
                .addFilterBefore(httpJWTAuthFilter(), UsernamePasswordAuthenticationFilter.class)
                .authorizeHttpRequests(registry -> registry
                        .requestMatchers("/error").permitAll()
                        .requestMatchers(anonymousAllowedPaths).permitAll()
                        .anyRequest().authenticated()
                ).csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(request -> {
                    var corsConfiguration = new org.springframework.web.cors.CorsConfiguration();
                    corsConfiguration.setAllowedOrigins(List.of(allowedOrigin));
                    corsConfiguration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
                    corsConfiguration.setAllowedHeaders(List.of("*"));
                    return corsConfiguration;
                }));
        return security.build();
    }

    public boolean isAnonymousAllowedPath(String path) {
        for (String allowedPath : anonymousAllowedPaths) {
            if (path.equals(allowedPath)) {
                return true;
            }
        }
        return false;
    }

    @Bean
    public HTTPJWTAuthFilter httpJWTAuthFilter() {
        return new HTTPJWTAuthFilter();
    }
}
