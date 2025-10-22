package Pet.Society.config;

import Pet.Society.models.exceptions.security.CustomAccessDeniedHandler;
import Pet.Society.models.exceptions.security.CustomAuthenticationEntryPoint;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity

public class SecurityConfig {


    private JwtAuthFilter jwtAuthFilter;
    private CustomAccessDeniedHandler customAccessDeniedHandler;
    private CustomAuthenticationEntryPoint customAuthenticationEntryPoint;

    @Autowired
    public SecurityConfig(JwtAuthFilter jwtAuthFilter,
                          CustomAccessDeniedHandler customAccessDeniedHandler,
                          CustomAuthenticationEntryPoint customAuthenticationEntryPoint) {
        this.jwtAuthFilter = jwtAuthFilter;
        this.customAccessDeniedHandler = customAccessDeniedHandler;
        this.customAuthenticationEntryPoint = customAuthenticationEntryPoint;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())

                .authorizeHttpRequests(auth -> auth
                        //REGISTRARSE Y LOGUEARSE
                        .requestMatchers(HttpMethod.POST,"/register/new/client").permitAll()
                        .requestMatchers(HttpMethod.POST,"/auth/login").permitAll()
                        .requestMatchers(HttpMethod.POST,"/register/new/admin").permitAll()
                        //ACCESS TO PETS
                        .requestMatchers("/pet/**").hasAnyRole("ADMIN","CLIENT")
                        //ACCESS TO CLIENTS
                        .requestMatchers("/client/**").hasAnyRole("ADMIN","CLIENT")
                        //ACCESS TO APPOINTMENTS
                        .requestMatchers(HttpMethod.POST,"/appointment/uploadAvailability/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST,"/appointment/create").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PATCH,"/appointment/assign/**").hasRole("CLIENT")
                        .requestMatchers(HttpMethod.DELETE,"/appointment/delete/**").hasRole("CLIENT")
                        .requestMatchers(HttpMethod.PATCH,"/appointment/**").hasRole("ADMIN")
                        //ACCESS TO DOCTOR
                        .requestMatchers("/doctor/**").hasRole("ADMIN")
                        // ACCESS TO DIAGNOSES
                        .requestMatchers("/diagnoses/create").hasRole("DOCTOR")
                        .requestMatchers("/diagnoses/getByPetId/**").hasAnyRole("CLIENT","ADMIN")
                        .requestMatchers("/diagnoses/findById/**",
                                    "/diagnoses/getLastDiagnoses/**",
                                    "/diagnoses/getAll",
                                    "/diagnoses/getByDoctorId/**",
                                "/diagnoses/lastDiagnoses/**").hasAnyRole("ADMIN","DOCTOR")
                        .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll() //For use correctly the OPENAPI
                        .anyRequest().permitAll()

                )
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint(customAuthenticationEntryPoint)
                        .accessDeniedHandler(customAccessDeniedHandler)
                )
                //FILTER WHEN WE IMPLMENT JWT SERVICE
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
                //CONFIGURATION BY DEFAULT DISABLE BECAUSE WE ARE USING JWT
                .formLogin(login -> login.disable())
                .httpBasic(basic -> basic.disable())
                //sessionManagement helps to not create automatic sessions.
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .cors(Customizer.withDefaults());

        return http.build();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // Configuration for frontend, they need this for work
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("*")); // Cambiar por dominios específicos en producción
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
