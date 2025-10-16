package pe.tucompu.eventos_api.controller;

import pe.tucompu.eventos_api.dto.LoginRequest;
import pe.tucompu.eventos_api.dto.SignupRequest;
import pe.tucompu.eventos_api.dto.TokenResponse;
import pe.tucompu.eventos_api.model.Usuario;
import pe.tucompu.eventos_api.repository.UsuarioRepository;
import pe.tucompu.eventos_api.security.JwtService;
import pe.tucompu.eventos_api.service.CryptoService;
import org.springframework.http.ResponseEntity;
import org.springframework.http.ResponseCookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final UsuarioRepository repo;
    private final PasswordEncoder encoder;
    private final JwtService jwt;
    private final CryptoService crypto;

    public AuthController(UsuarioRepository repo,
            PasswordEncoder encoder,
            JwtService jwt,
            CryptoService crypto) {
        this.repo = repo;
        this.encoder = encoder;
        this.jwt = jwt;
        this.crypto = crypto;
    }

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody SignupRequest req) {
        if (repo.findByUsername(req.getUsername()).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("error", "username ya existe"));
        }
        Usuario u = new Usuario();
        u.setUsername(req.getUsername());
        u.setNombre(req.getNombre());
        u.setEmail(null);
        u.setEmailEnc(crypto.encrypt(req.getEmail()));
        u.setPasswordHash(encoder.encode(req.getPassword()));
        u.setRoles(Set.of("USER"));
        repo.save(u);
        return ResponseEntity.ok(Map.of("message", "registrado"));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req, HttpServletRequest httpReq,
            HttpServletResponse httpRes) {
        var opt = repo.findByUsername(req.getUsername());
        if (opt.isEmpty())
            return ResponseEntity.status(401).body(Map.of("error", "credenciales"));
        var u = opt.get();
        if (!encoder.matches(req.getPassword(), u.getPasswordHash())) {
            return ResponseEntity.status(401).body(Map.of("error", "credenciales"));
        }
        String token = jwt.generate(u.getId(), Map.of(
                "username", u.getUsername(),
                "roles", u.getRoles()));
        // Set cookie HttpOnly con el JWT (stateless)
        boolean secure = httpReq.isSecure() || "https".equalsIgnoreCase(httpReq.getHeader("X-Forwarded-Proto"));
        ResponseCookie cookie = ResponseCookie
                .from("ACCESS_TOKEN", token)
                .httpOnly(true)
                .secure(secure)
                .path("/")
                .sameSite("Lax")
                .build();
        httpRes.addHeader("Set-Cookie", cookie.toString());
        return ResponseEntity.ok(new TokenResponse(token));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest httpReq, HttpServletResponse httpRes) {
        // Borrar cookie
        boolean secure = httpReq.isSecure() || "https".equalsIgnoreCase(httpReq.getHeader("X-Forwarded-Proto"));
        ResponseCookie cookie = ResponseCookie
                .from("ACCESS_TOKEN", "")
                .httpOnly(true)
                .secure(secure)
                .path("/")
                .sameSite("Lax")
                .maxAge(0)
                .build();
        httpRes.addHeader("Set-Cookie", cookie.toString());
        return ResponseEntity.ok(Map.of("message", "logged out"));
    }
}
