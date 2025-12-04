package pe.tucompu.eventos_api.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import pe.tucompu.eventos_api.model.Opinion;

public interface OpinionRepository extends MongoRepository<Opinion, String> {
    List<Opinion> findByServicioId(String servicioId);

    long countByServicioId(String servicioId);
}
