package pe.tucompu.eventos_api.dto;

import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonFormat;

import jakarta.validation.constraints.NotBlank;

public record CartItemRequest(
        String servicioId,
        @NotBlank String servicioNombre,
        String tipoEvento,
        String mensaje,
        Integer invitados,
        @JsonFormat(pattern = "yyyy-MM-dd") LocalDate fechaEvento,
        Double priceFrom,
        String origen) {
}
