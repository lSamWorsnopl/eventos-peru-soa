package pe.tucompu.eventos_api.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.QueueBuilder;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.fasterxml.jackson.databind.SerializationFeature;

@Configuration
@ConditionalOnProperty(prefix = "app.notifications", name = "enabled", havingValue = "true", matchIfMissing = true)
public class NotificationConfig {

    @Bean
    public TopicExchange notificationsExchange(NotificationProperties props) {
        return new TopicExchange(props.getExchange(), true, false);
    }

    @Bean
    public Queue notificationsQueue(NotificationProperties props) {
        return QueueBuilder.durable(props.getQueue()).build();
    }

    @Bean
    public Binding notificationsBinding(Queue notificationsQueue, TopicExchange notificationsExchange,
            NotificationProperties props) {
        return BindingBuilder.bind(notificationsQueue)
                .to(notificationsExchange)
                .with(props.getRoutingKey());
    }

    @Bean
    public MessageConverter jacksonAmqpMessageConverter(ObjectMapper objectMapper) {
        var mapper = objectMapper.copy();
        mapper.registerModule(new JavaTimeModule());
        mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        return new Jackson2JsonMessageConverter(mapper);
    }
}
