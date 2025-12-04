package pe.tucompu.eventos_api.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;

import pe.tucompu.eventos_api.model.Usuario;

public interface UsuarioRepository extends MongoRepository<Usuario, String> {
    Optional<Usuario> findByUsername(String username);
}
