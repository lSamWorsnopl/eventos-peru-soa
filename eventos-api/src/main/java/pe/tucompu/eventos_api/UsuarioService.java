package pe.tucompu.eventos_api;

import org.springframework.stereotype.Service;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class UsuarioService {

    private final UsuarioRepository repo;
    private final PasswordEncoder encoder;
    private final CryptoService crypto;

    public UsuarioService(UsuarioRepository repo, PasswordEncoder encoder, CryptoService crypto) {
        this.repo = repo;
        this.encoder = encoder;
        this.crypto = crypto;
    }

    public List<Usuario> listar() {
        return repo.findAll();
    }

    public Usuario crear(Usuario u) {
        u.setId(null);
        if (u.getEmail() != null) {
            u.setEmailEnc(crypto.encrypt(u.getEmail()));
            u.setEmail(null);
        }
        if (u.getPasswordHash() != null && !u.getPasswordHash().isBlank()) {
            u.setPasswordHash(encoder.encode(u.getPasswordHash()));
        }
        if (u.getRoles() == null || u.getRoles().isEmpty()) {
            u.setRoles(Set.of("USER"));
        }
        return repo.save(u);
    }

    public Optional<Usuario> obtener(String id) {
        return repo.findById(id);
    }

    public Optional<Usuario> actualizar(String id, Usuario cambios) {
        return repo.findById(id).map(actual -> {
            if (cambios.getUsername() != null)
                actual.setUsername(cambios.getUsername());
            if (cambios.getNombre() != null)
                actual.setNombre(cambios.getNombre());
            if (cambios.getEmail() != null)
                actual.setEmailEnc(crypto.encrypt(cambios.getEmail()));
            if (cambios.getPasswordHash() != null && !cambios.getPasswordHash().isBlank()) {
                actual.setPasswordHash(encoder.encode(cambios.getPasswordHash()));
            }
            if (cambios.getRoles() != null && !cambios.getRoles().isEmpty())
                actual.setRoles(cambios.getRoles());
            return repo.save(actual);
        });
    }

    public boolean eliminar(String id) {
        if (!repo.existsById(id))
            return false;
        repo.deleteById(id);
        return true;
    }
}
