package pe.tucompu.eventos_api.controller;

import pe.tucompu.eventos_api.dto.LoginRequest;
import pe.tucompu.eventos_api.dto.SignupRequest;
import pe.tucompu.eventos_api.dto.TokenResponse;
import pe.tucompu.eventos_api.model.Usuario;
import pe.tucompu.eventos_api.repository.UsuarioRepository;
import pe.tucompu.eventos_api.security.JwtService;
import pe.tucompu.eventos_api.service.CryptoService;
import org.springframework.http.ResponseEntity;
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
    private final CryptoService crypto; // 👈 NUEVO

    public AuthController(UsuarioRepository repo,
            PasswordEncoder encoder,
            JwtService jwt,
            CryptoService crypto) { // 👈 NUEVO
        this.repo = repo;
        this.encoder = encoder;
        this.jwt = jwt;
        this.crypto = crypto; // 👈 NUEVO
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
    public ResponseEntity<?> login(@RequestBody LoginRequest req) {
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
        return ResponseEntity.ok(new TokenResponse(token));
    }
}
