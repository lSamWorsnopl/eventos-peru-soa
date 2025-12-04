package pe.tucompu.eventos_api.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;

import java.time.LocalDateTime;
import java.util.List;

import org.junit.jupiter.api.Test;

import pe.tucompu.eventos_api.model.Servicio;
import pe.tucompu.eventos_api.repository.ServicioRepository;

class ServicioServiceTest {

    private final ServicioRepository repo = mock(ServicioRepository.class);
    private final ServicioService service = new ServicioService(repo);

    @Test
    void applyDynamicStatusCierraSiEstaBloqueadoPorCalidad() {
        Servicio s = new Servicio();
        s.setStatus(Servicio.Estado.ABIERTO);
        s.setStatusMode(Servicio.StatusMode.AUTO);
        s.setQualityBlocked(true);

        Servicio result = service.applyDynamicStatus(s);

        assertThat(result.getStatus()).isEqualTo(Servicio.Estado.CERRADO);
    }

    @Test
    void applyDynamicStatusAbreEnModoAutoCuandoHorarioDisponible() {
        Servicio s = new Servicio();
        s.setStatusMode(Servicio.StatusMode.AUTO);
        s.setQualityBlocked(false);
        s.setAvailableDates(List.of()); // sin restriccion de fecha

        Servicio.Schedule schedule = new Servicio.Schedule();
        schedule.setDay(LocalDateTime.now().getDayOfWeek().name().toLowerCase());
        schedule.setOpen("00:00");
        schedule.setClose("23:59");
        s.setSchedule(List.of(schedule));

        Servicio result = service.applyDynamicStatus(s);

        assertThat(result.getStatus()).isEqualTo(Servicio.Estado.ABIERTO);
    }
}
