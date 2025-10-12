package pe.tucompu.eventos_api.model;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Document(collection = "proveedores")
public class Proveedor {
    @Id
    private String id;

    @NotBlank
    @Indexed(unique = true)
    private String nombre;

    private String rubro; // p.ej. Sonido, Catering, Seguridad
    private String contacto; // nombre persona contacto

    @Email
    private String email;

    private String telefono;
    private boolean activo = true;
}
