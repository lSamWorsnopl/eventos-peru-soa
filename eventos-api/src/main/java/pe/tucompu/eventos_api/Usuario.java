package pe.tucompu.eventos_api;

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
    private transient String email; // nunca sale por API

    @JsonIgnore
    private String emailEnc; // cifrado en BD, no se expone

    @JsonIgnore
    private String passwordHash; // jamás exponer hashes

    private Set<String> roles;
}
