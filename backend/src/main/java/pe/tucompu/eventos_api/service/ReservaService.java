package pe.tucompu.eventos_api.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.ObjectProvider;
import org.springframework.stereotype.Service;

import pe.tucompu.eventos_api.dto.ReservaRequest;
import pe.tucompu.eventos_api.model.Cart;
import pe.tucompu.eventos_api.model.Reserva;
import pe.tucompu.eventos_api.repository.ReservaRepository;

@Service
public class ReservaService {

    private final ReservaRepository repo;
    private final Optional<NotificationService> notificationService;
    private final CartService cartService;

    public ReservaService(
            ReservaRepository repo,
            ObjectProvider<NotificationService> notificationServiceProvider,
            CartService cartService) {
        this.repo = repo;
        this.notificationService = Optional.ofNullable(notificationServiceProvider.getIfAvailable());
        this.cartService = cartService;
    }

    public Reserva crear(String userId, ReservaRequest request) {
        Reserva reserva = new Reserva();
        reserva.setUserId(userId);
        reserva.setOrigen(request.origen());
        reserva.setServicioId(request.servicioId());
        reserva.setServicioNombre(request.servicioNombre());
        reserva.setTipoEvento(request.tipoEvento());
        reserva.setMensaje(request.mensaje());
        reserva.setInvitados(request.invitados());
        reserva.setFechaEvento(request.fechaEvento());
        reserva.setCreadoEn(LocalDateTime.now());
        reserva.setEstado(Reserva.Estado.PENDIENTE);

        Reserva.Contacto contacto = new Reserva.Contacto();
        contacto.setNombre(request.nombre());
        contacto.setEmail(request.email());
        contacto.setTelefono(request.telefono());
        reserva.setContacto(contacto);

        if (request.cartItemIds() != null && !request.cartItemIds().isEmpty()) {
            List<Cart.Item> consumed = cartService.consumeItems(userId, request.cartItemIds());
            if (!consumed.isEmpty()) {
                List<Reserva.CartItemSnapshot> snapshots = consumed.stream().map(this::toSnapshot).toList();
                reserva.setCartItems(snapshots);
                if (reserva.getServicioNombre() == null) {
                    reserva.setServicioNombre(consumed.get(0).getServicioNombre());
                }
                if (reserva.getServicioId() == null) {
                    reserva.setServicioId(consumed.get(0).getServicioId());
                }
            }
        }

        Reserva saved = repo.save(reserva);
        notificationService.ifPresent(service -> service.notifyReservaCreada(saved));
        return saved;
    }

    private Reserva.CartItemSnapshot toSnapshot(Cart.Item item) {
        Reserva.CartItemSnapshot snap = new Reserva.CartItemSnapshot();
        snap.setItemId(item.getItemId());
        snap.setServicioId(item.getServicioId());
        snap.setServicioNombre(item.getServicioNombre());
        snap.setTipoEvento(item.getTipoEvento());
        snap.setMensaje(item.getMensaje());
        snap.setInvitados(item.getInvitados());
        snap.setFechaEvento(item.getFechaEvento());
        snap.setPriceFrom(item.getPriceFrom());
        snap.setOrigen(item.getOrigen());
        return snap;
    }

    public List<Reserva> listarTodas(Reserva.Estado estado) {
        if (estado != null) {
            return repo.findByEstado(estado);
        }
        return repo.findAll();
    }

    public List<Reserva> listarDelUsuario(String userId, Reserva.Estado estado) {
        if (estado != null) {
            return repo.findByUserIdAndEstado(userId, estado);
        }
        return repo.findByUserId(userId);
    }

    public Optional<Reserva> cambiarEstado(String id, Reserva.Estado nuevoEstado) {
        return repo.findById(id).map(actual -> {
            actual.setEstado(nuevoEstado);
            return repo.save(actual);
        });
    }
}
