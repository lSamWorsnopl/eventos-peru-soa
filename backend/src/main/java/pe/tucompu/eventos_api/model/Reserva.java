package pe.tucompu.eventos_api.model;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.Data;

@Data
@Document(collection = "reservas")
public class Reserva {

    public enum Estado {
        PENDIENTE, CONTACTADO, CONFIRMADO, CANCELADO
    }

    @Id
    private String id;

    @Indexed
    private String userId;

    private String origen;
    private String servicioId;
    private String servicioNombre;
    private String tipoEvento;
    private String mensaje;
    private Integer invitados;
    private LocalDate fechaEvento;

    private Contacto contacto;

    private LocalDateTime creadoEn;
    private Estado estado;
    private List<CartItemSnapshot> cartItems;

    @Data
    public static class Contacto {
        private String nombre;
        private String email;
        private String telefono;
    }

    @Data
    public static class CartItemSnapshot {
        private String itemId;
        private String servicioId;
        private String servicioNombre;
        private String tipoEvento;
        private String mensaje;
        private Integer invitados;
        private LocalDate fechaEvento;
        private Double priceFrom;
        private String origen;
    }
}
