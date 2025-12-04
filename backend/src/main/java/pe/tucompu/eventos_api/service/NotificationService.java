package pe.tucompu.eventos_api.service;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.AmqpException;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import pe.tucompu.eventos_api.config.NotificationProperties;
import pe.tucompu.eventos_api.dto.NotificationMessage;
import pe.tucompu.eventos_api.model.Evento;
import pe.tucompu.eventos_api.model.Reserva;

@Service
@ConditionalOnProperty(prefix = "app.notifications", name = "enabled", havingValue = "true", matchIfMissing = true)
public class NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);

    private final RabbitTemplate rabbitTemplate;
    private final NotificationProperties props;

    public NotificationService(RabbitTemplate rabbitTemplate, NotificationProperties props) {
        this.rabbitTemplate = rabbitTemplate;
        this.props = props;
    }

    public void notifyEventoCreado(Evento evento) {
        NotificationMessage message = new NotificationMessage(
                "EVENT_CREATED",
                evento.getId(),
                evento.getCreadoPor(),
                evento.getNombre(),
                evento.getEstado() != null ? evento.getEstado().name() : null,
                evento.getFechaHora(),
                Instant.now(),
                "EMAIL",
                null);
        publish(message);
    }

    public void notifyCambioEstado(Evento evento) {
        NotificationMessage message = new NotificationMessage(
                "EVENT_STATUS_CHANGED",
                evento.getId(),
                evento.getCreadoPor(),
                evento.getNombre(),
                evento.getEstado() != null ? evento.getEstado().name() : null,
                evento.getFechaHora(),
                Instant.now(),
                "EMAIL",
                null);
        publish(message);
    }

    public void notifyReservaCreada(Reserva reserva) {
        Map<String, Object> extras = new HashMap<>();
        extras.put("userId", reserva.getUserId());
        if (reserva.getContacto() != null) {
            extras.put("clienteNombre", reserva.getContacto().getNombre());
            extras.put("clienteEmail", reserva.getContacto().getEmail());
            extras.put("clienteTelefono", reserva.getContacto().getTelefono());
        }
        if (reserva.getServicioNombre() != null) {
            extras.put("servicioNombre", reserva.getServicioNombre());
        }
        if (reserva.getOrigen() != null) {
            extras.put("origen", reserva.getOrigen());
        }
        if (reserva.getInvitados() != null) {
            extras.put("invitados", reserva.getInvitados());
        }
        if (reserva.getCartItems() != null && !reserva.getCartItems().isEmpty()) {
            extras.put("cartItems", reserva.getCartItems());
        }

        NotificationMessage message = new NotificationMessage(
                "RESERVATION_CREATED",
                null,
                null,
                reserva.getServicioNombre(),
                reserva.getEstado() != null ? reserva.getEstado().name() : null,
                reserva.getFechaEvento() != null ? reserva.getFechaEvento().atStartOfDay() : null,
                Instant.now(),
                "EMAIL",
                extras.isEmpty() ? null : extras);
        publish(message);
    }

    private void publish(NotificationMessage message) {
        try {
            rabbitTemplate.convertAndSend(props.getExchange(), props.getRoutingKey(), message);
            log.debug("Publicada notificaci\u00f3n {}.", message.type());
        } catch (AmqpException ex) {
            log.error("No se pudo publicar la notificaci\u00f3n {}: {}", message.type(), ex.getMessage());
        }
    }
}
