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
import java.util.UUID;
import java.time.LocalDateTime;
import java.util.regex.Pattern;

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
            return ResponseEntity.badRequest().body(Map.of("message", "username ya existe"));
        }
        // Validación de email (básica)
        if (req.getEmail() == null || !Pattern.compile("^[^@\n\r]+@[^@\n\r]+\\.[^@\n\r]+$").matcher(req.getEmail()).matches()) {
            return ResponseEntity.badRequest().body(Map.of("message", "email inválido"));
        }
        // Política de contraseña: >= 8, mayúscula, minúscula, dígito, especial
        String pwd = req.getPassword() == null ? "" : req.getPassword();
        boolean strong = pwd.length() >= 8
                && Pattern.compile("[A-Z]").matcher(pwd).find()
                && Pattern.compile("[a-z]").matcher(pwd).find()
                && Pattern.compile("[0-9]").matcher(pwd).find()
                && Pattern.compile("[^A-Za-z0-9]").matcher(pwd).find();
        if (!strong) {
            return ResponseEntity.badRequest().body(Map.of(
                    "message",
                    "La contraseña debe tener al menos 8 caracteres, con mayúscula, minúscula, número y símbolo"));
        }
        Usuario u = new Usuario();
        u.setUsername(req.getUsername());
        u.setNombre(req.getNombre());
        u.setEmail(null);
        u.setEmailEnc(crypto.encrypt(req.getEmail()));
        u.setPasswordHash(encoder.encode(req.getPassword()));
        u.setRoles(Set.of("USER"));
        // Marcar no verificado y crear token con expiración 24h
        u.setEmailVerified(false);
        u.setEmailVerifToken(UUID.randomUUID().toString());
        u.setEmailVerifExpiresAt(LocalDateTime.now().plusHours(24));
        repo.save(u);
        // "Enviar" email (simulación): log con URL de verificación
        String verifyUrl = "/auth/verify?token=" + u.getEmailVerifToken();
        System.out.println(">>> [DEV] Verifica tu correo visitando: " + verifyUrl);
        return ResponseEntity.accepted().body(Map.of(
                "message", "Se envió un enlace de verificación a tu correo",
                "devVerifyToken", u.getEmailVerifToken()));
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
        if (!u.isEmailVerified()) {
            return ResponseEntity.status(403).body(Map.of("message", "email no verificado"));
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

    @GetMapping("/verify")
    public ResponseEntity<?> verify(@RequestParam("token") String token) {
        var userOpt = repo.findAll().stream()
                .filter(usr -> token.equals(usr.getEmailVerifToken()))
                .findFirst();
        if (userOpt.isEmpty()) return ResponseEntity.badRequest().body(Map.of("message", "token inválido"));
        var u = userOpt.get();
        if (u.getEmailVerifExpiresAt() != null && u.getEmailVerifExpiresAt().isBefore(LocalDateTime.now())) {
            return ResponseEntity.badRequest().body(Map.of("message", "token expirado"));
        }
        u.setEmailVerified(true);
        u.setEmailVerifToken(null);
        u.setEmailVerifExpiresAt(null);
        repo.save(u);
        return ResponseEntity.ok(Map.of("message", "correo verificado"));
    }

    @PostMapping("/resend-verification")
    public ResponseEntity<?> resendVerification(@RequestBody Map<String, String> body) {
        String username = body.get("username");
        if (username == null || username.isBlank()) return ResponseEntity.badRequest().body(Map.of("message", "username requerido"));
        var opt = repo.findByUsername(username);
        if (opt.isEmpty()) return ResponseEntity.status(404).body(Map.of("message", "usuario no encontrado"));
        var u = opt.get();
        if (u.isEmailVerified()) return ResponseEntity.ok(Map.of("message", "ya verificado"));
        u.setEmailVerifToken(UUID.randomUUID().toString());
        u.setEmailVerifExpiresAt(LocalDateTime.now().plusHours(24));
        repo.save(u);
        String verifyUrl = "/auth/verify?token=" + u.getEmailVerifToken();
        System.out.println(">>> [DEV] Reenvío verificación: " + verifyUrl);
        return ResponseEntity.ok(Map.of("message", "enlace reenviado"));
    }
}
