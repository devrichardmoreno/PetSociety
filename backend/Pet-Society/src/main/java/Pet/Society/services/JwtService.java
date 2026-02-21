package Pet.Society.services;
import Pet.Society.models.entities.CredentialEntity;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;




@Service
public class JwtService {


    @Value("${jwt.secret}")
    private String jwtSecret;


    public String generateToken(UserDetails userDetails) {
        return Jwts.builder().
                setSubject(userDetails.getUsername())
                .claim("role", userDetails.getAuthorities())
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60 )) // 1 hour
                .signWith(getKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return (username.equals(userDetails.getUsername()) && !isTokenExpired(token));
    }

    public String extractUsername(String token) {
        return extractAllClaims(token).getSubject();
    }

    /**
     * Genera un token especial para reset de contraseña
     * Expira en 30 minutos y tiene un claim especial "resetPassword: true"
     */
    public String generatePasswordResetToken(String username) {
        return Jwts.builder()
                .setSubject(username)
                .claim("resetPassword", true)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 30)) // 30 minutos
                .signWith(getKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * Valida si un token es válido para reset de contraseña
     */
    public boolean isPasswordResetTokenValid(String token) {
        try {
            Claims claims = extractAllClaims(token);
            Boolean isResetToken = claims.get("resetPassword", Boolean.class);
            return isResetToken != null && isResetToken && !isTokenExpired(token);
        } catch (Exception e) {
            return false;
        }
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    private boolean isTokenExpired(String token) {
        return extractAllClaims(token).getExpiration().before(new Date());
    }

    private Key getKey() {
        byte[] keyBytes = jwtSecret.getBytes(StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
    }



}
