package pe.tucompu.notification_worker.service;

import java.nio.charset.StandardCharsets;
import java.time.format.DateTimeFormatter;
import java.util.Map;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import pe.tucompu.notification_worker.config.AppProperties;
import pe.tucompu.notification_worker.dto.NotificationMessage;

@Service
public class NotificationListener {

    private static final Logger log = LoggerFactory.getLogger(NotificationListener.class);

    private final JavaMailSender mailSender;
    private final AppProperties properties;
    private final ObjectMapper objectMapper;

    @Autowired
    public NotificationListener(JavaMailSender mailSender, AppProperties properties, ObjectMapper objectMapper) {
        this.mailSender = mailSender;
        this.properties = properties;
        this.objectMapper = objectMapper;
    }

    @RabbitListener(queues = "${app.rabbit.queue}")
    public void handleNotification(byte[] rawBytes) {
        try {
            String rawMessage = new String(rawBytes, StandardCharsets.UTF_8);
            JsonNode node = objectMapper.readTree(rawMessage);
            NotificationMessage message = toMessage(node);
            String recipient = resolveRecipient(message);
            if (recipient == null || recipient.isBlank()) {
                log.warn("No hay destinatario para el mensaje {}", message);
                return;
            }
            SimpleMailMessage mail = buildMessage(recipient, message);
            mailSender.send(mail);
            log.info("Correo enviado a {} para evento {}", recipient, message.eventName());
        } catch (Exception ex) {
            log.error("No se pudo enviar correo. Payload binario recibido, longitud {}.", rawBytes.length, ex);
        }
    }

    private String resolveRecipient(NotificationMessage message) {
        Map<String, Object> extras = message.extras();
        if (extras == null) return null;
        Object email = extras.get("clienteEmail");
        if (email instanceof String e && !e.isBlank()) {
            return e;
        }
        // fallback: destination field
        if (message.destination() != null && !message.destination().isBlank()) {
            return message.destination();
        }
        return null;
    }

    private SimpleMailMessage buildMessage(String recipient, NotificationMessage message) {
        SimpleMailMessage mail = new SimpleMailMessage();
        mail.setTo(recipient);
        mail.setFrom(properties.mail().from());
        mail.setSubject(properties.mail().subjectPrefix() + " - " + defaultString(message.eventName(), "Reserva"));
        mail.setText(buildBody(message));
        return mail;
    }

    private String buildBody(NotificationMessage message) {
        StringBuilder sb = new StringBuilder();
        sb.append("Hola! Hemos recibido tu solicitud.\n\n");
        if (message.eventName() != null) {
            sb.append("Servicio: ").append(message.eventName()).append('\n');
        }
        if (message.fechaEvento() != null) {
            sb.append("Fecha del evento: ")
                    .append(message.fechaEvento().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")))
                    .append('\n');
        }
        if (message.estado() != null) {
            sb.append("Estado: ").append(message.estado()).append('\n');
        }
        sb.append("\nPronto nos pondremos en contacto. Gracias por elegirnos.");
        return sb.toString();
    }

    private String defaultString(String value, String def) {
        return value != null && !value.isBlank() ? value : def;
    }

    /**
     * Parse flexible JSON into our NotificationMessage, tolerating unexpected shapes.
     */
    private NotificationMessage toMessage(JsonNode node) {
        String type = text(node, "type");
        String eventId = text(node, "eventId");
        String userId = text(node, "userId");
        String eventName = text(node, "eventName");
        String estado = text(node, "estado");
        java.time.LocalDateTime fechaEvento = parseDate(node.path("fechaEvento"));
        java.time.Instant createdAt = parseInstant(node.path("createdAt"));
        String destination = text(node, "destination");
        Map<String, Object> extras = Optional.ofNullable(node.get("extras"))
                .map(n -> objectMapper.convertValue(n, Map.class))
                .orElse(null);
        return new NotificationMessage(type, eventId, userId, eventName, estado, fechaEvento, createdAt, destination, extras);
    }

    private String text(JsonNode node, String field) {
        JsonNode val = node.get(field);
        if (val != null) {
            if (val.isTextual()) return val.asText();
            if (val.isNumber()) return val.asText();
            // if object/array, ignore to avoid conversion errors
        }
        return null;
    }

    private java.time.LocalDateTime parseDate(JsonNode node) {
        if (node == null || node.isNull()) return null;
        if (!node.isTextual()) return null;
        try {
            return java.time.LocalDateTime.parse(node.asText(), DateTimeFormatter.ISO_DATE_TIME);
        } catch (Exception e) {
            return null;
        }
    }

    private java.time.Instant parseInstant(JsonNode node) {
        if (node == null || node.isNull()) return null;
        if (!node.isTextual()) return null;
        try {
            return java.time.Instant.parse(node.asText());
        } catch (Exception e) {
            return null;
        }
    }
}
