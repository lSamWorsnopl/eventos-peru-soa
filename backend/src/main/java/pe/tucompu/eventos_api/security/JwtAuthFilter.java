package pe.tucompu.eventos_api.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collection;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtService jwt;

    public JwtAuthFilter(JwtService jwt) {
        this.jwt = jwt;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {

        String header = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7);
            try {
                Jws<Claims> jws = jwt.parse(token);
                String userId = jws.getBody().getSubject();
                Object rolesObj = jws.getBody().get("roles");
                Collection<SimpleGrantedAuthority> authorities = List.of();

                if (rolesObj instanceof List<?> roles) {
                    authorities = roles.stream()
                            .map(Object::toString)
                            .map(r -> new SimpleGrantedAuthority("ROLE_" + r))
                            .collect(Collectors.toList());
                }

                var auth = new UsernamePasswordAuthenticationToken(userId, null, authorities);
                SecurityContextHolder.getContext().setAuthentication(auth);
                System.out.println(">>> JwtAuthFilter header = " + request.getHeader("Authorization"));
                System.out.println(
                        ">>> Jwt OK, sub=" + jws.getBody().getSubject() + " roles=" + jws.getBody().get("roles"));
            } catch (Exception e) {
                // token inválido/expirado: seguimos sin autenticar (caerá en 401 si el endpoint
                // lo requiere)
            }
        }
        chain.doFilter(request, response);

    }
}
