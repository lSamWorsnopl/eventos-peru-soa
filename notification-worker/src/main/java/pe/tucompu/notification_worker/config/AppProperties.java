package pe.tucompu.notification_worker.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.bind.DefaultValue;

@ConfigurationProperties(prefix = "app")
public record AppProperties(Rabbit rabbit, Mail mail) {

    public record Rabbit(
            @DefaultValue("eventos.notifications.queue") String queue,
            @DefaultValue("eventos.notifications.exchange") String exchange,
            @DefaultValue("eventos.notifications.created") String routingKey) {
    }

    public record Mail(
            String from,
            @DefaultValue("Correo de Eventos Peru") String senderName,
            @DefaultValue("Tu reserva ha sido recibida") String subjectPrefix) {
    }
}
