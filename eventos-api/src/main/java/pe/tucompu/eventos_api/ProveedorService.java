package pe.tucompu.eventos_api;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ProveedorService {

    private final ProveedorRepository repo;

    public ProveedorService(ProveedorRepository repo) {
        this.repo = repo;
    }

    public List<Proveedor> listar() {
        return repo.findAll();
    }

    public Proveedor crear(Proveedor p) {
        p.setId(null);
        return repo.save(p);
    }

    public Optional<Proveedor> obtener(String id) {
        return repo.findById(id);
    }

    public Optional<Proveedor> actualizar(String id, Proveedor cambios) {
        return repo.findById(id).map(actual -> {
            if (cambios.getNombre() != null)
                actual.setNombre(cambios.getNombre());
            if (cambios.getRubro() != null)
                actual.setRubro(cambios.getRubro());
            if (cambios.getContacto() != null)
                actual.setContacto(cambios.getContacto());
            if (cambios.getEmail() != null)
                actual.setEmail(cambios.getEmail());
            if (cambios.getTelefono() != null)
                actual.setTelefono(cambios.getTelefono());
            actual.setActivo(cambios.isActivo());
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
