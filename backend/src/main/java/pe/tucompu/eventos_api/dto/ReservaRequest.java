package pe.tucompu.eventos_api.dto;

import java.time.LocalDate;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonFormat;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record ReservaRequest(
        @NotBlank String origen,
        @NotBlank String nombre,
        @NotBlank @Email String email,
        String telefono,
        String tipoEvento,
        String mensaje,
        @JsonFormat(pattern = "yyyy-MM-dd") LocalDate fechaEvento,
        Integer invitados,
        String servicioId,
        String servicioNombre,
        List<String> cartItemIds) {
}
