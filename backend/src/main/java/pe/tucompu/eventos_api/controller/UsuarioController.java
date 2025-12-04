package pe.tucompu.eventos_api.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.Map;

import pe.tucompu.eventos_api.model.Usuario;
import pe.tucompu.eventos_api.dto.ChangePasswordRequest;
import pe.tucompu.eventos_api.service.UsuarioService;

@RestController
@RequestMapping("/api/users")
public class UsuarioController {

    private final UsuarioService service;

    public UsuarioController(UsuarioService service) {
        this.service = service;
    }

    @GetMapping
    public List<Usuario> listar() {
        return service.listar();
    }

    @PostMapping
    public ResponseEntity<Usuario> crear(@RequestBody Usuario u) {
        Usuario creado = service.crear(u);
        return ResponseEntity.created(URI.create("/api/users/" + creado.getId())).body(creado);
    }

    @GetMapping("{id}")
    public ResponseEntity<Usuario> obtener(@PathVariable String id) {
        return service.obtener(id).map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("{id}")
    public ResponseEntity<Usuario> actualizar(@PathVariable String id, @RequestBody Usuario u) {
        return service.actualizar(id, u).map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("{id}")
    public ResponseEntity<Void> eliminar(@PathVariable String id) {
        return service.eliminar(id) ? ResponseEntity.noContent().build()
                : ResponseEntity.notFound().build();
    }

    @PatchMapping("/me/password")
    public ResponseEntity<?> changeMyPassword(@RequestBody ChangePasswordRequest req, Authentication auth) {
        if (auth == null || auth.getName() == null) return ResponseEntity.status(401).build();
        if (req.getCurrentPassword() == null || req.getNewPassword() == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "faltan campos"));
        }
        try {
            boolean ok = service.changePasswordForUsername(auth.getName(), req.getCurrentPassword(), req.getNewPassword());
            if (!ok) return ResponseEntity.status(404).body(Map.of("message", "usuario no encontrado"));
            return ResponseEntity.ok(Map.of("message", "password cambiada"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(400).body(Map.of("message", "Contraseña actual incorrecta"));
        }
    }
}
