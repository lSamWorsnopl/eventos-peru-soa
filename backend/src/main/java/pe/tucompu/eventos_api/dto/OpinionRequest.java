package pe.tucompu.eventos_api.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record OpinionRequest(
        @NotBlank String nombre,
        @Email(message = "email invalido") String email,
        @NotNull @Min(1) @Max(5) Integer rating,
        @NotBlank String comentario) {
}
