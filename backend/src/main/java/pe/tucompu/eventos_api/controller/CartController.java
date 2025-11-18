package pe.tucompu.eventos_api.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import pe.tucompu.eventos_api.dto.CartItemRequest;
import pe.tucompu.eventos_api.model.Cart;
import pe.tucompu.eventos_api.service.CartService;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    @GetMapping
    public Cart getCart(Authentication auth) {
        return cartService.getOrCreate(auth.getName());
    }

    @PostMapping("/items")
    public ResponseEntity<Cart> addItem(@Valid @RequestBody CartItemRequest request, Authentication auth) {
        Cart cart = cartService.addItem(auth.getName(), request);
        return ResponseEntity.ok(cart);
    }

    @PutMapping("/items/{itemId}")
    public ResponseEntity<Cart> updateItem(@PathVariable String itemId,
            @Valid @RequestBody CartItemRequest request,
            Authentication auth) {
        Cart cart = cartService.updateItem(auth.getName(), itemId, request);
        return ResponseEntity.ok(cart);
    }

    @DeleteMapping("/items/{itemId}")
    public ResponseEntity<Void> removeItem(@PathVariable String itemId, Authentication auth) {
        cartService.removeItem(auth.getName(), itemId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping
    public ResponseEntity<Void> clear(Authentication auth) {
        cartService.clear(auth.getName());
        return ResponseEntity.noContent().build();
    }
}
