package pe.tucompu.eventos_api.model;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.Data;

@Data
@Document(collection = "carts")
public class Cart {

    @Id
    private String id;

    @Indexed(unique = true)
    private String userId;

    private List<Item> items = new ArrayList<>();

    private LocalDateTime updatedAt;

    @Data
    public static class Item {
        private String itemId;
        private String servicioId;
        private String servicioNombre;
        private String tipoEvento;
        private String mensaje;
        private Integer invitados;
        private LocalDate fechaEvento;
        private Double priceFrom;
        private String origen;
        private LocalDateTime addedAt;
    }
}
