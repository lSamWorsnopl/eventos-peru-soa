package pe.tucompu.eventos_api;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Set;

@Data
@Document(collection = "usuarios")
public class Usuario {

    @Id
    private String id;

    private String username;
    private String nombre;

    // ESTE campo ya no se guarda en BD (opcional si usas DTOs)
    private transient String email;

    // ESTE campo sí se guarda, pero cifrado
    private String emailEnc;

    private String passwordHash;
    private Set<String> roles;
}
