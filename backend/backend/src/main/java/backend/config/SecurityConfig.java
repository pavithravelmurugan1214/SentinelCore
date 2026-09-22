package backend.config;

import backend.security.JwtAuthenticationFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration configuration) throws Exception {

        return configuration.getAuthenticationManager();

    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http)
            throws Exception {

        http

                .csrf(csrf -> csrf.disable())

                .cors(Customizer.withDefaults())

                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )

                .authorizeHttpRequests(auth -> auth

                        // ===========================
                        // Swagger UI & OpenAPI Docs
                        // ===========================
                        .requestMatchers("/swagger-ui/**").permitAll()
                        .requestMatchers("/v3/api-docs/**").permitAll()
                        .requestMatchers("/swagger-ui.html").permitAll()

                        // ===========================
                        // Public APIs
                        // ===========================
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/api/assets/register").permitAll()
                        .requestMatchers("/api/assets/heartbeat").permitAll()
                        .requestMatchers("/api/playbooks/simulate-brute-force").permitAll()
                        .requestMatchers("/api/playbooks/simulate-unauthorized-login").permitAll()
                        .requestMatchers("/api/playbooks/target-status").permitAll()
                        .requestMatchers("/api/playbooks/reset-simulation").permitAll()
                        .requestMatchers("/api/playbooks/simulate-phishing").permitAll()
                        .requestMatchers("/api/playbooks/executions/**").permitAll()

                        // ===========================
                        // WebSocket
                        // ===========================
                        .requestMatchers("/ws/**").permitAll()
                        .requestMatchers("/topic/**").permitAll()
                        .requestMatchers("/app/**").permitAll()

                        // ===========================
                        // Users
                        // ===========================
                        .requestMatchers("/api/users/**")
                        .hasRole("ADMIN")

                        // ===========================
                        // Roles
                        // ===========================
                        .requestMatchers("/api/roles/**")
                        .hasRole("ADMIN")

                        // ===========================
                        // Dashboard
                        // ===========================
                        .requestMatchers("/api/dashboard/**")
                        .hasAnyRole("ADMIN", "ANALYST", "VIEWER", "MANAGER")

                        // ===========================
                        // Asset APIs
                        // ===========================
                        .requestMatchers(HttpMethod.GET,
                                "/api/assets/**")
                        .hasAnyRole("ADMIN", "ANALYST", "VIEWER")

                        .requestMatchers(HttpMethod.POST,
                                "/api/assets/**")
                        .hasAnyRole("ADMIN", "ANALYST")

                        .requestMatchers(HttpMethod.PUT,
                                "/api/assets/**")
                        .hasAnyRole("ADMIN", "ANALYST")

                        .requestMatchers(HttpMethod.DELETE,
                                "/api/assets/**")
                        .hasRole("ADMIN")

                        // ===========================
                        // Threat APIs
                        // ===========================
                        .requestMatchers(HttpMethod.GET,
                                "/api/threats/**")
                        .hasAnyRole("ADMIN", "ANALYST", "VIEWER", "MANAGER")

                        .requestMatchers(HttpMethod.POST,
                                "/api/threats/**")
                        .hasAnyRole("ADMIN", "ANALYST")

                        .requestMatchers(HttpMethod.PUT,
                                "/api/threats/**")
                        .hasAnyRole("ADMIN", "ANALYST")

                        .requestMatchers(HttpMethod.DELETE,
                                "/api/threats/**")
                        .hasRole("ADMIN")

                        // ===========================
                        // IOC APIs
                        // ===========================
                        .requestMatchers(HttpMethod.GET,
                                "/api/ioc/**")
                        .hasAnyRole("ADMIN", "ANALYST", "VIEWER", "MANAGER")

                        .requestMatchers(HttpMethod.POST,
                                "/api/ioc/**")
                        .hasAnyRole("ADMIN", "ANALYST")

                        .requestMatchers(HttpMethod.PUT,
                                "/api/ioc/**")
                        .hasAnyRole("ADMIN", "ANALYST")

                        .requestMatchers(HttpMethod.DELETE,
                                "/api/ioc/**")
                        .hasRole("ADMIN")

                        // ===========================
                        // Alerts
                        // ===========================
                        .requestMatchers(HttpMethod.GET,
                                "/api/alerts/**")
                        .hasAnyRole("ADMIN", "ANALYST", "VIEWER", "MANAGER")

                        .requestMatchers(HttpMethod.POST,
                                "/api/alerts/**")
                        .hasAnyRole("ADMIN", "ANALYST")

                        .requestMatchers(HttpMethod.PUT,
                                "/api/alerts/**")
                        .hasAnyRole("ADMIN", "ANALYST")

                        .requestMatchers(HttpMethod.DELETE,
                                "/api/alerts/**")
                        .hasRole("ADMIN")

                        // ===========================
                        // Alert Rules & Engine
                        // ===========================
                        .requestMatchers(HttpMethod.GET,
                                "/api/alert-rules/**")
                        .hasAnyRole("ADMIN", "ANALYST", "VIEWER", "MANAGER")

                        .requestMatchers(HttpMethod.POST,
                                "/api/alert-rules/**")
                        .hasAnyRole("ADMIN", "ANALYST")

                        .requestMatchers(HttpMethod.PUT,
                                "/api/alert-rules/**")
                        .hasAnyRole("ADMIN", "ANALYST")

                        .requestMatchers(HttpMethod.DELETE,
                                "/api/alert-rules/**")
                        .hasRole("ADMIN")

                        .requestMatchers("/api/alert-engine/**")
                        .hasAnyRole("ADMIN", "ANALYST")

                        // ===========================
                        // Notifications
                        // ===========================
                        .requestMatchers(HttpMethod.GET,
                                "/api/notifications/**")
                        .hasAnyRole("ADMIN", "ANALYST", "VIEWER", "MANAGER")

                        .requestMatchers(HttpMethod.PUT,
                                "/api/notifications/**")
                        .hasAnyRole("ADMIN", "ANALYST", "VIEWER", "MANAGER")

                        .requestMatchers(HttpMethod.DELETE,
                                "/api/notifications/**")
                        .hasRole("ADMIN")

                        // ===========================
                        // Knowledge Base
                        // ===========================
                        .requestMatchers(HttpMethod.GET,
                                "/api/kb/**")
                        .hasAnyRole("ADMIN", "ANALYST", "VIEWER", "MANAGER")

                        .requestMatchers(HttpMethod.POST,
                                "/api/kb/**")
                        .hasRole("ADMIN")

                        .requestMatchers(HttpMethod.PUT,
                                "/api/kb/**")
                        .hasRole("ADMIN")

                        .requestMatchers(HttpMethod.DELETE,
                                "/api/kb/**")
                        .hasRole("ADMIN")

                        // ===========================
                        // Incident KB Articles Mapping
                        // ===========================
                        .requestMatchers(HttpMethod.POST,
                                "/api/incidents/*/kb-articles/*")
                        .hasRole("ADMIN")

                        .requestMatchers(HttpMethod.DELETE,
                                "/api/incidents/*/kb-articles/*")
                        .hasRole("ADMIN")

                        // ===========================
                        // Reports
                        // ===========================
                        .requestMatchers("/api/reports/**")
                        .hasAnyRole("ADMIN", "ANALYST", "VIEWER", "MANAGER")

                        // ===========================
                        // Profile
                        // ===========================
                        .requestMatchers("/api/profile/**")
                        .hasAnyRole("ADMIN", "ANALYST", "VIEWER")

                        // ===========================
                        // Settings
                        // ===========================
                        .requestMatchers(HttpMethod.GET, "/api/settings/**")
                        .permitAll()

                        .requestMatchers(HttpMethod.PUT, "/api/settings/**")
                        .hasRole("ADMIN")

                        .requestMatchers(HttpMethod.POST, "/api/settings/**")
                        .hasRole("ADMIN")

                        // ===========================
                        // Allow OPTIONS
                        // ===========================
                        .requestMatchers(HttpMethod.OPTIONS, "/**")
                        .permitAll()

                        // ===========================
                        // Everything Else
                        // ===========================
                        // Security Event Ingestion
                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/events/ingest"
                        )
                        .hasAnyRole("ADMIN", "ANALYST")
                        .anyRequest()
                        .authenticated()

                )

                .httpBasic(httpBasic -> httpBasic.disable())

                .formLogin(form -> form.disable());

        http.addFilterBefore(
                jwtAuthenticationFilter,
                UsernamePasswordAuthenticationFilter.class
        );

        return http.build();

    }

}