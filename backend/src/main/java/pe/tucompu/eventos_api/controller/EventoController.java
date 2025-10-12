package pe.tucompu.eventos_api.controller;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

import pe.tucompu.eventos_api.model.Evento;
import pe.tucompu.eventos_api.model.Proveedor;
import pe.tucompu.eventos_api.service.EventoService;

@RestController
@RequestMapping("/api/eventos")
public class EventoController {

    private final EventoService service;

    public EventoController(EventoService service) {
        this.service = service;
    }

    @GetMapping
    public List<Evento> listar(Authentication auth) {
        String userId = auth.getName(); // subject del JWT
        return service.listarDelUsuario(userId);
    }

    @PostMapping
    public ResponseEntity<Evento> crear(@Valid @RequestBody Evento e, Authentication auth) {
        String userId = auth.getName();
        Evento creado = service.crear(userId, e);
        return ResponseEntity.created(URI.create("/api/eventos/" + creado.getId())).body(creado);
    }

    @GetMapping("{id}")
    public ResponseEntity<Evento> obtener(@PathVariable String id, Authentication auth) {
        String userId = auth.getName();
        return service.obtener(userId, id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("{id}")
    public ResponseEntity<Evento> actualizar(@PathVariable String id, @RequestBody Evento e, Authentication auth) {
        String userId = auth.getName();
        return service.actualizar(userId, id, e).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("{id}")
    public ResponseEntity<Void> eliminar(@PathVariable String id, Authentication auth) {
        String userId = auth.getName();
        return service.eliminar(userId, id) ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
    }

    @PostMapping("{id}/proveedores/{provId}")
    public ResponseEntity<Evento> asignarProveedor(@PathVariable String id, @PathVariable String provId,
            Authentication auth) {
        String userId = auth.getName();
        return service.asignarProveedor(userId, id, provId)
                .map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("{id}/proveedores/{provId}")
    public ResponseEntity<Evento> quitarProveedor(@PathVariable String id, @PathVariable String provId,
            Authentication auth) {
        String userId = auth.getName();
        return service.quitarProveedor(userId, id, provId)
                .map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("{id}/proveedores")
    public ResponseEntity<List<Proveedor>> listarProveedores(@PathVariable String id, Authentication auth) {
        String userId = auth.getName();
        var lista = service.listarProveedoresDeEvento(userId, id);
        return ResponseEntity.ok(lista);
    }

    @PatchMapping("{id}/estado")
    public ResponseEntity<Evento> cambiarEstado(
            @PathVariable String id,
            @RequestParam Evento.Estado estado,
            Authentication auth) {
        String userId = auth.getName();
        return service.cambiarEstado(userId, id, estado)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

}
