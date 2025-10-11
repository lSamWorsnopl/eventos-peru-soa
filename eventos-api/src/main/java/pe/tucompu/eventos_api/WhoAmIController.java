package pe.tucompu.eventos_api;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.stream.Collectors;

@RestController
public class WhoAmIController {

    @GetMapping("/api/me")
    public Map<String, Object> me(Authentication auth) {
        if (auth == null)
            return Map.of("authenticated", false);
        return Map.of(
                "authenticated", true,
                "principal", auth.getName(),
                "authorities", auth.getAuthorities().stream().map(Object::toString).collect(Collectors.toList()));
    }
}
