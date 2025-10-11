package pe.tucompu.eventos_api;

import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface EventoRepository extends MongoRepository<Evento, String> {
    List<Evento> findByCreadoPor(String userId);
}
