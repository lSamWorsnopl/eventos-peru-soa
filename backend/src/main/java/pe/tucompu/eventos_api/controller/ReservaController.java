package pe.tucompu.eventos_api.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import pe.tucompu.eventos_api.dto.ReservaRequest;
import pe.tucompu.eventos_api.model.Reserva;
import pe.tucompu.eventos_api.service.ReservaService;

@RestController
@RequestMapping("/api/reservas")
public class ReservaController {

    private final ReservaService reservaService;

    public ReservaController(ReservaService reservaService) {
        this.reservaService = reservaService;
    }

    @GetMapping
    public List<Reserva> listar(@RequestParam(name = "estado", required = false) Reserva.Estado estado,
            Authentication auth) {
        if (esAdmin(auth)) {
            return reservaService.listarTodas(estado);
        }
        return reservaService.listarDelUsuario(auth.getName(), estado);
    }

    @PostMapping
    public ResponseEntity<Reserva> crear(@Valid @RequestBody ReservaRequest request, Authentication auth) {
        Reserva creada = reservaService.crear(auth.getName(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(creada);
    }

    @PatchMapping("{id}/estado")
    public ResponseEntity<Reserva> actualizarEstado(@PathVariable String id,
            @RequestParam("estado") Reserva.Estado estado,
            Authentication auth) {
        if (!esAdmin(auth)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        Optional<Reserva> actualizada = reservaService.cambiarEstado(id, estado);
        return actualizada.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    private boolean esAdmin(Authentication auth) {
        if (auth == null) {
            return false;
        }
        return auth.getAuthorities().stream().map(GrantedAuthority::getAuthority)
                .anyMatch("ROLE_ADMIN"::equals);
    }
}
