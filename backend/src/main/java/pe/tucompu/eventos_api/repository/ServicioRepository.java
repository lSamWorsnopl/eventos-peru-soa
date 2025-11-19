package pe.tucompu.eventos_api.repository;

import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

import pe.tucompu.eventos_api.model.Servicio;

public interface ServicioRepository extends MongoRepository<Servicio, String> {

    Optional<Servicio> findBySlug(String slug);

    boolean existsBySlug(String slug);
}
