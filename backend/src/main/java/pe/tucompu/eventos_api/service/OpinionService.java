package pe.tucompu.eventos_api.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import pe.tucompu.eventos_api.dto.OpinionRequest;
import pe.tucompu.eventos_api.model.Opinion;
import pe.tucompu.eventos_api.model.Servicio;
import pe.tucompu.eventos_api.repository.OpinionRepository;
import pe.tucompu.eventos_api.repository.ServicioRepository;

@Service
public class OpinionService {

    private static final double BLOCK_THRESHOLD = 2.5;
    private static final int MIN_REVIEWS_FOR_BLOCK = 3;

    private final OpinionRepository opinionRepository;
    private final ServicioRepository servicioRepository;

    public OpinionService(OpinionRepository opinionRepository, ServicioRepository servicioRepository) {
        this.opinionRepository = opinionRepository;
        this.servicioRepository = servicioRepository;
    }

    public Opinion agregarOpinion(String userId, String servicioId, OpinionRequest request) {
        Servicio servicio = servicioRepository.findById(servicioId)
                .orElseThrow(() -> new IllegalArgumentException("Servicio no encontrado"));
        Opinion opinion = new Opinion();
        opinion.setServicioId(servicioId);
        opinion.setUserId(userId);
        opinion.setNombre(request.nombre());
        opinion.setEmail(request.email());
        opinion.setRating(request.rating());
        opinion.setComentario(request.comentario());
        opinion.setCreadoEn(LocalDateTime.now());
        Opinion saved = opinionRepository.save(opinion);
        recalcularCalidad(servicio);
        return saved;
    }

    public List<Opinion> listarPorServicio(String servicioId) {
        return opinionRepository.findByServicioId(servicioId);
    }

    public Optional<Servicio> bloquearPorCalidad(String servicioId, String motivo) {
        return servicioRepository.findById(servicioId).map(servicio -> {
            servicio.setQualityBlocked(true);
            servicio.setQualityBlockedReason(StringUtils.hasText(motivo) ? motivo : "Bloqueado por administrador");
            servicio.setQualityBlockedAt(LocalDateTime.now());
            servicio.setStatus(Servicio.Estado.CERRADO);
            servicio.setUpdatedAt(LocalDateTime.now());
            return servicioRepository.save(servicio);
        });
    }

    private void recalcularCalidad(Servicio servicio) {
        List<Opinion> opiniones = opinionRepository.findByServicioId(servicio.getId());
        int total = opiniones.size();
        double promedio = opiniones.stream().mapToInt(Opinion::getRating).average().orElse(0.0);
        servicio.setReviews(total);
        servicio.setRating(total == 0 ? null : promedio);
        boolean debeBloquear = total >= MIN_REVIEWS_FOR_BLOCK && promedio < BLOCK_THRESHOLD;
        if (debeBloquear) {
            servicio.setQualityBlocked(true);
            servicio.setQualityBlockedReason(
                    "Bloqueado por rating promedio " + String.format(Locale.US, "%.2f", promedio) + " con " + total
                            + " opiniones");
            servicio.setQualityBlockedAt(LocalDateTime.now());
            servicio.setStatus(Servicio.Estado.CERRADO);
        } else if (Boolean.TRUE.equals(servicio.getQualityBlocked()) && promedio >= BLOCK_THRESHOLD) {
            servicio.setQualityBlocked(false);
            servicio.setQualityBlockedReason(null);
            servicio.setQualityBlockedAt(null);
        }
        servicio.setUpdatedAt(LocalDateTime.now());
        servicioRepository.save(servicio);
    }
}
