package pe.tucompu.eventos_api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(scanBasePackages = "pe.tucompu.eventos_api")
public class EventosApiApplication {
	public static void main(String[] args) {
		SpringApplication.run(EventosApiApplication.class, args);
	}
}
