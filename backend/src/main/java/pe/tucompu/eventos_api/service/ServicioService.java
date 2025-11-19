package pe.tucompu.eventos_api.service;

import java.text.Normalizer;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import pe.tucompu.eventos_api.model.Servicio;
import pe.tucompu.eventos_api.repository.ServicioRepository;

@Service
public class ServicioService {

    private final ServicioRepository repository;

    public ServicioService(ServicioRepository repository) {
        this.repository = repository;
    }

    public List<Servicio> listar() {
        return repository.findAll();
    }

    public Optional<Servicio> obtener(String id) {
        return repository.findById(id);
    }

    public Optional<Servicio> obtenerPorSlug(String slug) {
        return repository.findBySlug(slug);
    }

    public Servicio crear(Servicio servicio) {
        servicio.setId(null);
        servicio.setSlug(generarSlug(servicio.getSlug(), servicio.getName()));
        var ahora = LocalDateTime.now();
        servicio.setCreatedAt(ahora);
        servicio.setUpdatedAt(ahora);
        return repository.save(servicio);
    }

    public Optional<Servicio> actualizar(String id, Servicio cambios) {
        return repository.findById(id).map(actual -> {
            if (StringUtils.hasText(cambios.getName()))
                actual.setName(cambios.getName());
            if (StringUtils.hasText(cambios.getSubtitle()))
                actual.setSubtitle(cambios.getSubtitle());
            if (cambios.getCategories() != null)
                actual.setCategories(cambios.getCategories());
            if (cambios.getTags() != null)
                actual.setTags(cambios.getTags());
            if (cambios.getStatus() != null)
                actual.setStatus(cambios.getStatus());
            if (StringUtils.hasText(cambios.getAddress()))
                actual.setAddress(cambios.getAddress());
            if (StringUtils.hasText(cambios.getCity()))
                actual.setCity(cambios.getCity());
            if (cambios.getPriceFrom() != null)
                actual.setPriceFrom(cambios.getPriceFrom());
            if (cambios.getRating() != null)
                actual.setRating(cambios.getRating());
            if (cambios.getReviews() != null)
                actual.setReviews(cambios.getReviews());
            if (StringUtils.hasText(cambios.getDescription()))
                actual.setDescription(cambios.getDescription());
            if (StringUtils.hasText(cambios.getSummary()))
                actual.setSummary(cambios.getSummary());
            if (cambios.getServices() != null)
                actual.setServices(cambios.getServices());
            if (cambios.getEvents() != null)
                actual.setEvents(cambios.getEvents());
            if (cambios.getAmenities() != null)
                actual.setAmenities(cambios.getAmenities());
            if (cambios.getSchedule() != null)
                actual.setSchedule(cambios.getSchedule());
            if (StringUtils.hasText(cambios.getHeroImage()))
                actual.setHeroImage(cambios.getHeroImage());
            if (cambios.getGallery() != null)
                actual.setGallery(cambios.getGallery());
            if (cambios.getCoordinates() != null)
                actual.setCoordinates(cambios.getCoordinates());
            if (cambios.getContact() != null)
                actual.setContact(cambios.getContact());
            if (cambios.getSocial() != null)
                actual.setSocial(cambios.getSocial());
            if (StringUtils.hasText(cambios.getSlug())) {
                actual.setSlug(generarSlug(cambios.getSlug(), cambios.getName() != null ? cambios.getName() : actual.getName()));
            }
            actual.setUpdatedAt(LocalDateTime.now());
            return repository.save(actual);
        });
    }

    public void eliminar(String id) {
        repository.deleteById(id);
    }

    private String generarSlug(String slugPropuesto, String nombre) {
        String base = StringUtils.hasText(slugPropuesto) ? slugPropuesto : nombre;
        if (!StringUtils.hasText(base)) {
            base = "servicio-" + System.currentTimeMillis();
        }
        String normalized = Normalizer.normalize(base, Normalizer.Form.NFD)
                .replaceAll("\\p{InCombiningDiacriticalMarks}+", "")
                .replaceAll("[^a-zA-Z0-9\\s-]", "")
                .trim()
                .replaceAll("\\s+", "-")
                .toLowerCase(Locale.ROOT);
        String candidate = normalized;
        int counter = 1;
        while (repository.existsBySlug(candidate)) {
            candidate = normalized + "-" + counter++;
        }
        return candidate;
    }
}
