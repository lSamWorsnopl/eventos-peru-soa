package pe.tucompu.notification_worker.dto;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.Map;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonIgnoreProperties(ignoreUnknown = true)
public record NotificationMessage(
        String type,
        String eventId,
        String userId,
        String eventName,
        String estado,
        LocalDateTime fechaEvento,
        Instant createdAt,
        String destination,
        Map<String, Object> extras) {
}
