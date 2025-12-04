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
import org.springframework.web.server.ResponseStatusException;

import jakarta.validation.Valid;
import pe.tucompu.eventos_api.dto.OpinionRequest;
import pe.tucompu.eventos_api.model.Opinion;
import pe.tucompu.eventos_api.model.Servicio;
import pe.tucompu.eventos_api.service.OpinionService;
import pe.tucompu.eventos_api.service.ServicioService;

@RestController
@RequestMapping("/api/servicios")
public class ServicioController {

    private final ServicioService servicioService;
    private final OpinionService opinionService;

    public ServicioController(ServicioService servicioService, OpinionService opinionService) {
        this.servicioService = servicioService;
        this.opinionService = opinionService;
    }

    @GetMapping
    public List<Servicio> listar(
            @RequestParam(name = "categoria", required = false) String categoria,
            @RequestParam(name = "mine", required = false, defaultValue = "false") boolean mine,
            Authentication auth) {
        List<Servicio> todos;
        if (mine) {
            if (auth == null)
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "auth requerida para ver tus servicios");
            todos = servicioService.listarPorOwner(auth.getName());
        } else {
            todos = servicioService.listar();
        }
        todos = servicioService.applyDynamicStatus(todos);
        if (!esAdmin(auth)) {
            todos = todos.stream().filter(s -> !Boolean.TRUE.equals(s.getQualityBlocked())).toList();
        }
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
            return ResponseEntity.ok(servicioService.applyDynamicStatus(porId.get()));
        Optional<Servicio> porSlug = servicioService.obtenerPorSlug(idOrSlug);
        return porSlug.map(servicioService::applyDynamicStatus).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{idOrSlug}/opiniones")
    public ResponseEntity<List<Opinion>> listarOpiniones(@PathVariable String idOrSlug) {
        Optional<Servicio> servicioOpt = resolverServicio(idOrSlug);
        return servicioOpt.map(s -> ResponseEntity.ok(opinionService.listarPorServicio(s.getId())))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{idOrSlug}/opiniones")
    public ResponseEntity<Servicio> opinar(@PathVariable String idOrSlug,
            @Valid @RequestBody OpinionRequest request,
            Authentication auth) {
        if (auth == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        Optional<Servicio> servicioOpt = resolverServicio(idOrSlug);
        if (servicioOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        opinionService.agregarOpinion(auth.getName(), servicioOpt.get().getId(), request);
        return resolverServicio(idOrSlug)
                .map(servicioService::applyDynamicStatus)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{idOrSlug}/bloquear-calidad")
    public ResponseEntity<Servicio> bloquearPorCalidad(@PathVariable String idOrSlug,
            @RequestParam(name = "motivo", required = false) String motivo,
            Authentication auth) {
        if (!esAdmin(auth)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        Optional<Servicio> servicioOpt = resolverServicio(idOrSlug);
        if (servicioOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Optional<Servicio> bloqueado = opinionService.bloquearPorCalidad(servicioOpt.get().getId(), motivo);
        return bloqueado.map(servicioService::applyDynamicStatus)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Servicio> crear(@Valid @RequestBody Servicio servicio, Authentication auth) {
        if (!(esAdmin(auth) || esProveedor(auth)))
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        if (!esAdmin(auth) || servicio.getOwnerUserId() == null || servicio.getOwnerUserId().isBlank()) {
            if (auth != null)
                servicio.setOwnerUserId(auth.getName());
        }
        Servicio creado = servicioService.crear(servicio);
        return ResponseEntity.status(HttpStatus.CREATED).body(creado);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Servicio> actualizar(@PathVariable String id,
            @RequestBody Servicio servicio,
            Authentication auth) {
        var existenteOpt = servicioService.obtener(id);
        if (existenteOpt.isEmpty())
            return ResponseEntity.notFound().build();
        Servicio existente = existenteOpt.get();
        boolean isAdmin = esAdmin(auth);
        boolean isProveedor = esProveedor(auth);
        if (!isAdmin) {
            if (!isProveedor)
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            var requesterId = auth != null ? auth.getName() : null;
            if (existente.getOwnerUserId() == null) {
                existente.setOwnerUserId(requesterId);
            } else if (!existente.getOwnerUserId().equals(requesterId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            servicio.setOwnerUserId(existente.getOwnerUserId());
        }
        return servicioService.actualizar(id, servicio)
                .map(servicioService::applyDynamicStatus)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable String id, Authentication auth) {
        var existenteOpt = servicioService.obtener(id);
        if (existenteOpt.isEmpty())
            return ResponseEntity.notFound().build();
        if (!puedeGestionar(auth, existenteOpt.get()))
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

    private boolean esProveedor(Authentication auth) {
        if (auth == null)
            return false;
        return auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch("ROLE_PROVEEDOR"::equals);
    }

    private boolean puedeGestionar(Authentication auth, Servicio servicio) {
        if (esAdmin(auth))
            return true;
        return esProveedor(auth)
                && servicio.getOwnerUserId() != null
                && servicio.getOwnerUserId().equals(auth.getName());
    }

    private Optional<Servicio> resolverServicio(String idOrSlug) {
        Optional<Servicio> porId = servicioService.obtener(idOrSlug);
        if (porId.isPresent())
            return porId;
        return servicioService.obtenerPorSlug(idOrSlug);
    }
}
