package pe.tucompu.eventos_api.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.notifications")
public class NotificationProperties {

    /**
     * Exchange sobre el que se publican los mensajes de eventos/notificaciones.
     */
    private String exchange = "eventos.notifications.exchange";

    /**
     * Queue que consumirá los mensajes (útil para declarar/bind automáticamente).
     */
    private String queue = "eventos.notifications.queue";

    /**
     * Routing key principal para las notificaciones emitidas desde el API.
     */
    private String routingKey = "eventos.notifications.created";

    /**
     * Permite deshabilitar la publicación (útil en entornos locales o pruebas).
     */
    private boolean enabled = true;

    public String getExchange() {
        return exchange;
    }

    public void setExchange(String exchange) {
        this.exchange = exchange;
    }

    public String getQueue() {
        return queue;
    }

    public void setQueue(String queue) {
        this.queue = queue;
    }

    public String getRoutingKey() {
        return routingKey;
    }

    public void setRoutingKey(String routingKey) {
        this.routingKey = routingKey;
    }

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }
}
