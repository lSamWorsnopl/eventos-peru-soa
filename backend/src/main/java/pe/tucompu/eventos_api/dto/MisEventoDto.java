package pe.tucompu.eventos_api.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class MisEventoDto {
    private String id;
    private String fecha;      // ISO-8601 fechaHora
    private String categoria;  // mapeado desde nombre
    private String estado;     // enum en texto
}

