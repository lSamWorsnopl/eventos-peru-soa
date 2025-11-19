package pe.tucompu.eventos_api.model;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.Data;

@Data
@Document(collection = "servicios")
public class Servicio {

    public enum Estado {
        ABIERTO,
        CERRADO
    }

    @Id
    private String id;

    @Indexed(unique = true)
    private String slug;

    private String name;
    private String subtitle;
    private List<String> categories;
    private List<String> tags;
    private Estado status;
    private String address;
    private String city;
    private Double priceFrom;
    private Double rating;
    private Integer reviews;
    private String description;
    private String summary;
    private List<String> services;
    private List<String> events;
    private List<String> amenities;
    private List<Schedule> schedule;
    private String heroImage;
    private List<String> gallery;
    private Coordinates coordinates;
    private Contact contact;
    private List<Social> social;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Data
    public static class Schedule {
        private String day;
        private String open;
        private String close;
        private String note;
    }

    @Data
    public static class Coordinates {
        private double lat;
        private double lng;
    }

    @Data
    public static class Contact {
        private String phone;
        private String email;
        private String host;
    }

    @Data
    public static class Social {
        private String label;
        private String icon;
        private String handle;
    }
}
