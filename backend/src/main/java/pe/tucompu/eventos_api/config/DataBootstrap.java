package pe.tucompu.eventos_api.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;

import pe.tucompu.eventos_api.model.Usuario;
import pe.tucompu.eventos_api.repository.UsuarioRepository;
import pe.tucompu.eventos_api.service.CryptoService;

import java.util.Set;

@Configuration
public class DataBootstrap {

    @Bean
    CommandLineRunner init(UsuarioRepository repo, PasswordEncoder encoder, CryptoService crypto) {
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
}

