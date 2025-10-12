package pe.tucompu.eventos_api.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

import pe.tucompu.eventos_api.model.Usuario;
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
}
