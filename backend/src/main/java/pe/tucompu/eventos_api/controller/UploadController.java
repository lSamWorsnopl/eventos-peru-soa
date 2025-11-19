package pe.tucompu.eventos_api.controller;

import java.io.IOException;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import pe.tucompu.eventos_api.service.FileStorageService;

@RestController
@RequestMapping("/api/uploads")
public class UploadController {

    private final FileStorageService storageService;

    public UploadController(FileStorageService storageService) {
        this.storageService = storageService;
    }

    @PostMapping
    public ResponseEntity<?> upload(@RequestParam("file") MultipartFile file, Authentication auth) {
        if (!(esAdmin(auth) || esProveedor(auth))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        try {
            String filename = storageService.store(file);
            return ResponseEntity.ok(Map.of("url", "/uploads/" + filename));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
        } catch (IOException ex) {
            return ResponseEntity.internalServerError().body(Map.of("message", "No se pudo guardar el archivo"));
        }
    }

    private boolean esAdmin(Authentication auth) {
        if (auth == null)
            return false;
        return auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch("ROLE_ADMIN"::equals);
    }

    private boolean esProveedor(Authentication auth) {
        if (auth == null)
            return false;
        return auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch("ROLE_PROVEEDOR"::equals);
    }
}
