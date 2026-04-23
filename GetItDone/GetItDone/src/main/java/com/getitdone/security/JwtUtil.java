package com.getitdone.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
public class JwtUtil {
    private final Key key;
    private final long validityMs = 1000L * 60 * 60 * 24; // 24h

    public JwtUtil(@Value("${jwt.secret}") String secret) {
        if (secret == null || secret.length() < 8)
            secret = "change-me-please-use-strong-secret";
        this.key = Keys.hmacShaKeyFor(secret.getBytes());
    }

    public String generateToken(String subject) {
        Date now = new Date();
        Date exp = new Date(now.getTime() + validityMs);
        return Jwts.builder()
                .setSubject(subject)
                .setIssuedAt(now)
                .setExpiration(exp)
                .signWith(key)
                .compact();
    }

    public String validateAndGetSubject(String token) {
        try {
            Jws<Claims> c = Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token);
            return c.getBody().getSubject();
        } catch (JwtException ex) {
            return null;
        }
    }
}
