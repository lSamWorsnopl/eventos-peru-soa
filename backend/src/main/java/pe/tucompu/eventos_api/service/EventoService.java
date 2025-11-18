package pe.tucompu.eventos_api.service;

import org.springframework.beans.factory.ObjectProvider;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import pe.tucompu.eventos_api.model.Evento;
import pe.tucompu.eventos_api.model.Proveedor;
import pe.tucompu.eventos_api.repository.EventoRepository;
import pe.tucompu.eventos_api.repository.ProveedorRepository;

@Service
public class EventoService {

    private final EventoRepository repo;
    private final ProveedorRepository proveedorRepo;
    private final Optional<NotificationService> notificationService;

    public EventoService(EventoRepository repo, ProveedorRepository proveedorRepo,
            ObjectProvider<NotificationService> notificationServiceProvider) {
        this.repo = repo;
        this.proveedorRepo = proveedorRepo;
        this.notificationService = Optional.ofNullable(notificationServiceProvider.getIfAvailable());
    }

    public List<Evento> listarDelUsuario(String userId) {
        return repo.findByCreadoPor(userId);
    }

    public Evento crear(String userId, Evento e) {
        e.setId(null);
        e.setCreadoPor(userId);
        e.setCreadoEn(LocalDateTime.now());
        e.setActualizadoEn(e.getCreadoEn());
        e.setEstado(Evento.Estado.CREADO);
        Evento creado = repo.save(e);
        notificationService.ifPresent(service -> service.notifyEventoCreado(creado));
        return creado;
    }

    public Optional<Evento> obtener(String userId, String id) {
        return repo.findById(id).filter(ev -> ev.getCreadoPor().equals(userId));
    }

    public Optional<Evento> actualizar(String userId, String id, Evento cambios) {
        return obtener(userId, id).map(actual -> {
            if (cambios.getNombre() != null)
                actual.setNombre(cambios.getNombre());
            if (cambios.getDescripcion() != null)
                actual.setDescripcion(cambios.getDescripcion());
            if (cambios.getFechaHora() != null)
                actual.setFechaHora(cambios.getFechaHora());
            if (cambios.getUbicacion() != null)
                actual.setUbicacion(cambios.getUbicacion());
            actual.setActualizadoEn(LocalDateTime.now());
            return repo.save(actual);
        });
    }

    public boolean eliminar(String userId, String id) {
        return obtener(userId, id).map(e -> {
            repo.deleteById(id);
            return true;
        }).orElse(false);
    }

    public Optional<Evento> asignarProveedor(String userId, String eventoId, String provId) {
        return obtener(userId, eventoId).map(ev -> {
            if (proveedorRepo.existsById(provId)) {
                var list = ev.getProveedorIds();
                if (list == null)
                    list = new java.util.ArrayList<>();
                if (!list.contains(provId))
                    list.add(provId);
                ev.setProveedorIds(list);
                ev.setActualizadoEn(java.time.LocalDateTime.now());
                return repo.save(ev);
            }
            return ev; // si no existe proveedor, no cambia (también podrías lanzar 404)
        });
    }

    public Optional<Evento> quitarProveedor(String userId, String eventoId, String provId) {
        return obtener(userId, eventoId).map(ev -> {
            var list = ev.getProveedorIds();
            if (list != null && list.remove(provId)) {
                ev.setActualizadoEn(java.time.LocalDateTime.now());
                return repo.save(ev);
            }
            return ev;
        });
    }

    public List<Proveedor> listarProveedoresDeEvento(String userId, String eventoId) {
        return obtener(userId, eventoId)
                .map(ev -> {
                    var ids = ev.getProveedorIds();
                    if (ids == null || ids.isEmpty()) {
                        return java.util.Collections.<Proveedor>emptyList();
                    }
                    return proveedorRepo.findAllById(ids);
                })
                .orElse(java.util.Collections.<Proveedor>emptyList());
    }

    public Optional<Evento> cambiarEstado(String userId, String id, Evento.Estado nuevo) {
        return obtener(userId, id).map(ev -> {
            ev.setEstado(nuevo);
            ev.setActualizadoEn(LocalDateTime.now());
            Evento actualizado = repo.save(ev);
            notificationService.ifPresent(service -> service.notifyCambioEstado(actualizado));
            return actualizado;
        });
    }

}
