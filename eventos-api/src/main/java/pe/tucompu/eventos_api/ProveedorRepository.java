package pe.tucompu.eventos_api;

import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface ProveedorRepository extends MongoRepository<Proveedor, String> {
    Optional<Proveedor> findByNombreIgnoreCase(String nombre);

    List<Proveedor> findByRubroIgnoreCase(String rubro);
}
