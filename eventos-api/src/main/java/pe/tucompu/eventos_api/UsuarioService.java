package pe.tucompu.eventos_api;

import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class UsuarioService {
    private final Map<String, Usuario> store = new ConcurrentHashMap<>();

    public List<Usuario> listar() {
        return new ArrayList<>(store.values());
    }

    public Usuario crear(Usuario u) {
        String id = UUID.randomUUID().toString();
        u.setId(id);
        store.put(id, u);
        return u;
    }

    public Optional<Usuario> obtener(String id) {
        return Optional.ofNullable(store.get(id));
    }

    public Optional<Usuario> actualizar(String id, Usuario cambios) {
        Usuario actual = store.get(id);
        if (actual == null)
            return Optional.empty();
        if (cambios.getUsername() != null)
            actual.setUsername(cambios.getUsername());
        if (cambios.getNombre() != null)
            actual.setNombre(cambios.getNombre());
        if (cambios.getEmail() != null)
            actual.setEmail(cambios.getEmail());
        return Optional.of(actual);
    }

    public boolean eliminar(String id) {
        return store.remove(id) != null;
    }
}
