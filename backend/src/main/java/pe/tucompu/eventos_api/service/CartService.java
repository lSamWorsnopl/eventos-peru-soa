package pe.tucompu.eventos_api.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import pe.tucompu.eventos_api.dto.CartItemRequest;
import pe.tucompu.eventos_api.model.Cart;
import pe.tucompu.eventos_api.repository.CartRepository;

@Service
public class CartService {

    private final CartRepository repository;

    public CartService(CartRepository repository) {
        this.repository = repository;
    }

    public Cart getOrCreate(String userId) {
        return repository.findByUserId(userId).map(cart -> {
            if (cart.getItems() == null) {
                cart.setItems(new ArrayList<>());
            }
            return cart;
        }).orElseGet(() -> {
            Cart cart = new Cart();
            cart.setUserId(userId);
            cart.setItems(new ArrayList<>());
            cart.setUpdatedAt(LocalDateTime.now());
            return repository.save(cart);
        });
    }

    public Cart addItem(String userId, CartItemRequest request) {
        Cart cart = getOrCreate(userId);
        if (cart.getItems() == null) {
            cart.setItems(new ArrayList<>());
        }
        Cart.Item item = new Cart.Item();
        item.setItemId(UUID.randomUUID().toString());
        item.setServicioId(request.servicioId());
        item.setServicioNombre(request.servicioNombre());
        item.setTipoEvento(request.tipoEvento());
        item.setMensaje(request.mensaje());
        item.setInvitados(request.invitados());
        item.setFechaEvento(request.fechaEvento());
        item.setPriceFrom(request.priceFrom());
        item.setOrigen(request.origen());
        item.setAddedAt(LocalDateTime.now());
        cart.getItems().add(item);
        cart.setUpdatedAt(LocalDateTime.now());
        return repository.save(cart);
    }

    public Cart updateItem(String userId, String itemId, CartItemRequest request) {
        Cart cart = getOrCreate(userId);
        if (cart.getItems() == null) {
            cart.setItems(new ArrayList<>());
        }
        cart.getItems().stream()
                .filter(it -> it.getItemId().equals(itemId))
                .findFirst()
                .ifPresent(item -> {
                    item.setServicioId(request.servicioId());
                    item.setServicioNombre(request.servicioNombre());
                    item.setTipoEvento(request.tipoEvento());
                    item.setMensaje(request.mensaje());
                    item.setInvitados(request.invitados());
                    item.setFechaEvento(request.fechaEvento());
                    item.setPriceFrom(request.priceFrom());
                    item.setOrigen(request.origen());
                });
        cart.setUpdatedAt(LocalDateTime.now());
        return repository.save(cart);
    }

    public void removeItem(String userId, String itemId) {
        Cart cart = getOrCreate(userId);
        boolean removed = cart.getItems().removeIf(it -> it.getItemId().equals(itemId));
        if (removed) {
            cart.setUpdatedAt(LocalDateTime.now());
            repository.save(cart);
        }
    }

    public void clear(String userId) {
        Cart cart = getOrCreate(userId);
        cart.setItems(new ArrayList<>());
        cart.setUpdatedAt(LocalDateTime.now());
        repository.save(cart);
    }

    public List<Cart.Item> consumeItems(String userId, List<String> itemIds) {
        if (itemIds == null || itemIds.isEmpty()) {
            return List.of();
        }
        Cart cart = getOrCreate(userId);
        if (cart.getItems() == null || cart.getItems().isEmpty()) {
            return List.of();
        }
        List<Cart.Item> selected = cart.getItems().stream()
                .filter(it -> itemIds.contains(it.getItemId()))
                .map(it -> {
                    Cart.Item snapshot = new Cart.Item();
                    snapshot.setItemId(it.getItemId());
                    snapshot.setServicioId(it.getServicioId());
                    snapshot.setServicioNombre(it.getServicioNombre());
                    snapshot.setTipoEvento(it.getTipoEvento());
                    snapshot.setMensaje(it.getMensaje());
                    snapshot.setInvitados(it.getInvitados());
                    snapshot.setFechaEvento(it.getFechaEvento());
                    snapshot.setPriceFrom(it.getPriceFrom());
                    snapshot.setOrigen(it.getOrigen());
                    snapshot.setAddedAt(it.getAddedAt());
                    return snapshot;
                })
                .toList();
        if (!selected.isEmpty()) {
            cart.getItems().removeIf(it -> itemIds.contains(it.getItemId()));
            cart.setUpdatedAt(LocalDateTime.now());
            repository.save(cart);
        }
        return selected;
    }
}
