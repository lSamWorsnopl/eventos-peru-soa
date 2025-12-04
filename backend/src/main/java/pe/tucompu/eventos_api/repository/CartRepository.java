package pe.tucompu.eventos_api.repository;

import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

import pe.tucompu.eventos_api.model.Cart;

public interface CartRepository extends MongoRepository<Cart, String> {
    Optional<Cart> findByUserId(String userId);
}
