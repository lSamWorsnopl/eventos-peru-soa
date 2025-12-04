package pe.tucompu.eventos_api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

import pe.tucompu.eventos_api.config.NotificationProperties;

@SpringBootApplication(scanBasePackages = "pe.tucompu.eventos_api")
@EnableConfigurationProperties(NotificationProperties.class)
public class EventosApiApplication {
	public static void main(String[] args) {
		SpringApplication.run(EventosApiApplication.class, args);
	}
}
