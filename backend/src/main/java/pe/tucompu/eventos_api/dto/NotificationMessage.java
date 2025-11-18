package pe.tucompu.eventos_api.dto;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.Map;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
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
