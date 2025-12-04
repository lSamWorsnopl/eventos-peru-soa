package pe.tucompu.eventos_api.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import pe.tucompu.eventos_api.dto.OpinionRequest;
import pe.tucompu.eventos_api.model.Opinion;
import pe.tucompu.eventos_api.model.Servicio;
import pe.tucompu.eventos_api.repository.OpinionRepository;
import pe.tucompu.eventos_api.repository.ServicioRepository;

class OpinionServiceTest {

    private OpinionRepository opinionRepo;
    private ServicioRepository servicioRepo;
    private OpinionService opinionService;

    @BeforeEach
    void setup() {
        opinionRepo = mock(OpinionRepository.class);
        servicioRepo = mock(ServicioRepository.class);
        opinionService = new OpinionService(opinionRepo, servicioRepo);
    }

    @Test
    void recalculaYBloqueaCuandoPromedioEsBajo() {
        Servicio servicio = new Servicio();
        servicio.setId("svc1");
        servicio.setStatus(Servicio.Estado.ABIERTO);
        servicio.setQualityBlocked(false);

        when(servicioRepo.findById("svc1")).thenReturn(Optional.of(servicio));
        when(opinionRepo.save(any(Opinion.class))).thenAnswer(inv -> inv.getArgument(0));
        when(opinionRepo.findByServicioId("svc1")).thenReturn(List.of(
                buildOpinion(1), buildOpinion(2), buildOpinion(2)));
        when(servicioRepo.save(any(Servicio.class))).thenAnswer(inv -> inv.getArgument(0));

        OpinionRequest req = new OpinionRequest("ana", "ana@test.com", 1, "malo");
        Opinion saved = opinionService.agregarOpinion("userX", "svc1", req);

        assertThat(saved.getServicioId()).isEqualTo("svc1");
        // servicio fue mutado y guardado en recalcularCalidad
        assertThat(servicio.getQualityBlocked()).isTrue();
        assertThat(servicio.getStatus()).isEqualTo(Servicio.Estado.CERRADO);
        assertThat(servicio.getReviews()).isEqualTo(3);
        assertThat(servicio.getRating()).isLessThan(2.5);
    }

    private Opinion buildOpinion(int rating) {
        Opinion op = new Opinion();
        op.setRating(rating);
        op.setComentario("test");
        op.setCreadoEn(LocalDateTime.now());
        return op;
    }
}
