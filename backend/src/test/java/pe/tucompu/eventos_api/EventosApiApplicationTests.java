package pe.tucompu.eventos_api;

import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
@Disabled("Disabled to avoid loading Mongo-dependent context during unit test runs")
class EventosApiApplicationTests {

	@Test
	void contextLoads() {
	}

}
