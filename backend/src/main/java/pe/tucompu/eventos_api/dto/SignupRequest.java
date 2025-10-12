package pe.tucompu.eventos_api.dto;

import lombok.Data;

@Data
public class SignupRequest {
    private String username;
    private String nombre;
    private String email;
    private String password;
}
