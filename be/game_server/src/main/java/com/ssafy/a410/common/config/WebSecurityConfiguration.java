package com.ssafy.a410.common.config;

import com.ssafy.a410.common.filter.HTTPJWTAuthFilter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

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

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity security) throws Exception {
        security
                .addFilterBefore(httpJWTAuthFilter(), UsernamePasswordAuthenticationFilter.class)
                .authorizeHttpRequests(registry -> registry
                        .requestMatchers(anonymousAllowedPaths).permitAll()
                        .anyRequest().authenticated()
                ).csrf(AbstractHttpConfigurer::disable);
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
