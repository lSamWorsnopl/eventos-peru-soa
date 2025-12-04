package pe.tucompu.eventos_api.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

import pe.tucompu.eventos_api.model.Evento;

public interface EventoRepository extends MongoRepository<Evento, String> {
    List<Evento> findByCreadoPor(String userId);
}
