package pe.tucompu.eventos_api.config;

import java.io.InputStream;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import pe.tucompu.eventos_api.model.Servicio;
import pe.tucompu.eventos_api.model.Usuario;
import pe.tucompu.eventos_api.repository.ServicioRepository;
import pe.tucompu.eventos_api.repository.UsuarioRepository;
import pe.tucompu.eventos_api.service.CryptoService;

@Configuration
public class DataBootstrap {

    @Bean
    CommandLineRunner initUsuarios(UsuarioRepository repo, PasswordEncoder encoder, CryptoService crypto) {
        return args -> {
            String pwd = System.getenv("INIT_ADMIN_PASSWORD");
            if (pwd != null && !pwd.isBlank()) {
                repo.findByUsername("admin").ifPresentOrElse(
                        u -> {},
                        () -> {
                            Usuario u = new Usuario();
                            u.setUsername("admin");
                            u.setNombre("Administrador");
                            u.setEmailEnc(null);
                            u.setPasswordHash(encoder.encode(pwd));
                            u.setRoles(Set.of("ADMIN"));
                            repo.save(u);
                            System.out.println(
                                    ">>> DataBootstrap: usuario admin creado (roles=ADMIN). Cambia INIT_ADMIN_PASSWORD y elimina al desplegar prod.");
                        });
            }
        };
    }

    @Bean
    CommandLineRunner initServicios(ServicioRepository repo, ObjectMapper mapper) {
        return args -> {
            if (repo.count() > 0)
                return;
            try {
                var resource = new ClassPathResource("data/servicios.json");
                if (!resource.exists())
                    return;
                try (InputStream is = resource.getInputStream()) {
                    List<Servicio> servicios = mapper.readValue(is, new TypeReference<List<Servicio>>() {
                    });
                    LocalDateTime now = LocalDateTime.now();
                    servicios.forEach(s -> {
                        s.setId(null);
                        s.setCreatedAt(now);
                        s.setUpdatedAt(now);
                    });
                    repo.saveAll(servicios);
                    System.out.println(">>> DataBootstrap: servicios iniciales cargados (" + servicios.size() + ")");
                }
            } catch (Exception e) {
                System.err.println("No se pudieron cargar servicios iniciales: " + e.getMessage());
            }
        };
    }
}
