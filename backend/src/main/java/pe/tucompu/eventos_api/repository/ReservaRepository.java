package pe.tucompu.eventos_api.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import pe.tucompu.eventos_api.model.Reserva;

public interface ReservaRepository extends MongoRepository<Reserva, String> {

    List<Reserva> findByEstado(Reserva.Estado estado);

    List<Reserva> findByUserId(String userId);

    List<Reserva> findByUserIdAndEstado(String userId, Reserva.Estado estado);

}
