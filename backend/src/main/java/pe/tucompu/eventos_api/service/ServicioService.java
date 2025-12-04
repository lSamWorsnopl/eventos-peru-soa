package pe.tucompu.eventos_api.service;

import java.text.Normalizer;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
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

    public List<Servicio> listarPorOwner(String ownerUserId) {
        if (ownerUserId == null || ownerUserId.isBlank()) return List.of();
        return repository.findByOwnerUserId(ownerUserId);
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
        if (servicio.getQualityBlocked() == null) {
            servicio.setQualityBlocked(false);
        }
        if (servicio.getReviews() == null) {
            servicio.setReviews(0);
        }
        if (servicio.getOwnerUserId() != null && servicio.getOwnerUserId().isBlank()) {
            servicio.setOwnerUserId(null);
        }
        if (servicio.getAvailabilityMode() == null) {
            servicio.setAvailabilityMode(Servicio.AvailabilityMode.FLEXIBLE);
        }
        if (servicio.getStatusMode() == null) {
            servicio.setStatusMode(Servicio.StatusMode.MANUAL);
        }
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
            if (cambios.getAvailableDates() != null)
                actual.setAvailableDates(cambios.getAvailableDates());
            if (cambios.getAvailabilityMode() != null)
                actual.setAvailabilityMode(cambios.getAvailabilityMode());
            if (cambios.getStatusMode() != null)
                actual.setStatusMode(cambios.getStatusMode());
            if (StringUtils.hasText(cambios.getSlug())) {
                actual.setSlug(generarSlug(cambios.getSlug(), cambios.getName() != null ? cambios.getName() : actual.getName()));
            }
            if (cambios.getOwnerUserId() != null) {
                actual.setOwnerUserId(cambios.getOwnerUserId().isBlank() ? null : cambios.getOwnerUserId());
            }
            actual.setUpdatedAt(LocalDateTime.now());
            return repository.save(actual);
        });
    }

    public void eliminar(String id) {
        repository.deleteById(id);
    }

    public Servicio applyDynamicStatus(Servicio servicio) {
        if (servicio == null)
            return null;
        if (Boolean.TRUE.equals(servicio.getQualityBlocked())) {
            servicio.setStatus(Servicio.Estado.CERRADO);
            return servicio;
        }
        if (servicio.getStatusMode() != Servicio.StatusMode.AUTO)
            return servicio;
        boolean abierto = evaluarAuto(servicio);
        servicio.setStatus(abierto ? Servicio.Estado.ABIERTO : Servicio.Estado.CERRADO);
        return servicio;
    }

    public List<Servicio> applyDynamicStatus(List<Servicio> servicios) {
        return servicios.stream().map(this::applyDynamicStatus).toList();
    }

    private boolean evaluarAuto(Servicio servicio) {
        LocalDateTime ahora = LocalDateTime.now(ZoneId.of("America/Lima"));
        if (!verificarFechaDisponible(servicio, ahora.toLocalDate()))
            return false;
        return verificarHorario(servicio, ahora.toLocalTime(), ahora.getDayOfWeek().name().toLowerCase(Locale.ROOT));
    }

    private boolean verificarFechaDisponible(Servicio servicio, LocalDate hoy) {
        var fechas = servicio.getAvailableDates();
        if (fechas == null || fechas.isEmpty())
            return true;
        String hoyStr = hoy.toString();
        return fechas.stream().map(String::trim).map(String::toLowerCase).anyMatch(f -> f.equals(hoyStr));
    }

    private boolean verificarHorario(Servicio servicio, LocalTime horaActual, String diaActual) {
        var horarios = servicio.getSchedule();
        if (horarios == null || horarios.isEmpty())
            return false;
        for (var slot : horarios) {
            if (slot == null || slot.getDay() == null)
                continue;
            String diaSlot = slot.getDay().trim().toLowerCase(Locale.ROOT);
            if (!diaSlot.equals(diaActual))
                continue;
            if (!StringUtils.hasText(slot.getOpen()) || !StringUtils.hasText(slot.getClose()))
                return true;
            try {
                LocalTime inicio = LocalTime.parse(slot.getOpen().trim());
                LocalTime fin = LocalTime.parse(slot.getClose().trim());
                if (!horaActual.isBefore(inicio) && !horaActual.isAfter(fin))
                    return true;
            } catch (Exception ex) {
                return false;
            }
        }
        return false;
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
