package pe.tucompu.eventos_api.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Set;

import com.fasterxml.jackson.annotation.JsonIgnore;
import org.springframework.data.mongodb.core.index.Indexed;

@Data
@Document(collection = "usuarios")
public class Usuario {
    @Id
    private String id;

    @Indexed(unique = true)
    private String username;

    private String nombre;

    @JsonIgnore
    private transient String email;

    @JsonIgnore
    private String emailEnc;

    @JsonIgnore
    private String passwordHash;

    private Set<String> roles;
}
