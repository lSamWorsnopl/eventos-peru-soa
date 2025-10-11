package pe.tucompu.eventos_api;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.List;

import java.time.LocalDateTime;

import org.springframework.data.mongodb.core.index.Indexed;

@Data
@Document(collection = "eventos")
public class Evento {
    public enum Estado {
        CREADO, EN_PROCESO, FINALIZADO, CANCELADO
    }

    @Id
    private String id;

    @NotBlank
    private String nombre;
    private String descripcion;

    @NotNull
    @FutureOrPresent
    private LocalDateTime fechaHora;

    private String ubicacion;

    @Indexed
    private String creadoPor;

    private LocalDateTime creadoEn;
    private LocalDateTime actualizadoEn;

    private List<String> proveedorIds;

    private Estado estado; // 👈 nuevo
}
