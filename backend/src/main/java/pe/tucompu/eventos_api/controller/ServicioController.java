package pe.tucompu.eventos_api.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import pe.tucompu.eventos_api.model.Servicio;
import pe.tucompu.eventos_api.service.ServicioService;

@RestController
@RequestMapping("/api/servicios")
public class ServicioController {

    private final ServicioService servicioService;

    public ServicioController(ServicioService servicioService) {
        this.servicioService = servicioService;
    }

    @GetMapping
    public List<Servicio> listar(@RequestParam(name = "categoria", required = false) String categoria) {
        var todos = servicioService.listar();
        if (categoria == null || categoria.isBlank())
            return todos;
        String filtro = categoria.trim().toLowerCase();
        return todos.stream()
                .filter(s -> s.getCategories() != null && s.getCategories().stream()
                        .anyMatch(cat -> cat != null && cat.toLowerCase().contains(filtro)))
                .toList();
    }

    @GetMapping("/{idOrSlug}")
    public ResponseEntity<Servicio> obtener(@PathVariable String idOrSlug) {
        Optional<Servicio> porId = servicioService.obtener(idOrSlug);
        if (porId.isPresent())
            return ResponseEntity.ok(porId.get());
        Optional<Servicio> porSlug = servicioService.obtenerPorSlug(idOrSlug);
        return porSlug.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Servicio> crear(@Valid @RequestBody Servicio servicio, Authentication auth) {
        if (!esAdmin(auth))
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        Servicio creado = servicioService.crear(servicio);
        return ResponseEntity.status(HttpStatus.CREATED).body(creado);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Servicio> actualizar(@PathVariable String id,
            @RequestBody Servicio servicio,
            Authentication auth) {
        if (!esAdmin(auth))
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        return servicioService.actualizar(id, servicio)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable String id, Authentication auth) {
        if (!esAdmin(auth))
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        servicioService.eliminar(id);
        return ResponseEntity.noContent().build();
    }

    private boolean esAdmin(Authentication auth) {
        if (auth == null)
            return false;
        return auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch("ROLE_ADMIN"::equals);
    }
}
