package pe.tucompu.eventos_api.repository;

import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

import pe.tucompu.eventos_api.model.Proveedor;

public interface ProveedorRepository extends MongoRepository<Proveedor, String> {
    Optional<Proveedor> findByNombreIgnoreCase(String nombre);

    List<Proveedor> findByRubroIgnoreCase(String rubro);
}
