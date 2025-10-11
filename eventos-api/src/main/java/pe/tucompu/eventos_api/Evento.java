package pe.tucompu.eventos_api;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.List;

import java.time.LocalDateTime;

@Data
@Document(collection = "eventos")
public class Evento {
    @Id
    private String id;

    @NotBlank
    private String nombre;

    private String descripcion;

    @NotNull
    @FutureOrPresent
    private LocalDateTime fechaHora;

    private String ubicacion;

    // auditoría mínima
    private String creadoPor; // userId (subject del JWT)
    private LocalDateTime creadoEn;
    private LocalDateTime actualizadoEn;
    private List<String> proveedorIds;
}
