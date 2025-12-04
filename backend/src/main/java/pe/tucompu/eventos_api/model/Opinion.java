package pe.tucompu.eventos_api.model;

import java.time.LocalDateTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
@Document(collection = "opiniones")
public class Opinion {

    @Id
    private String id;

    @Indexed
    private String servicioId;

    @Indexed
    private String userId;

    private String nombre;

    private String email;

    @NotNull
    @Min(1)
    @Max(5)
    private Integer rating;

    @NotBlank
    private String comentario;

    private LocalDateTime creadoEn;
}
